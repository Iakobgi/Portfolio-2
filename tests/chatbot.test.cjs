const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');
const source = readFileSync(join(__dirname, '..', 'script.js'), 'utf8');
function setup(fetch) {
  const messages = [];
  const context = vm.createContext({ fetch, AbortController, setTimeout, clearTimeout,
    currentLanguage: 'en', conversationHistory: [], chatRequestPending: false,
    chatbotInput: { value: '' }, addMessage: (text, role) => messages.push({ text, role }),
    showTypingIndicator() {}, hideTypingIndicator() {}
  });
  vm.runInContext(source.slice(source.indexOf('async function getAIReply('), source.indexOf('function fillIndexPage()')), context);
  vm.runInContext(source.slice(source.indexOf('async function sendChatbotQuestion('), source.indexOf('if (chatbotForm && chatbotInput)')), context);
  return { context, messages };
}
test('follow-up request sends valid role/content history', async () => {
  const bodies = [];
  const { context } = setup(async (_url, init) => {
    bodies.push(JSON.parse(init.body));
    return Response.json({ answer: 'He builds websites.' });
  });
  await context.sendChatbotQuestion('What does he do?');
  await context.sendChatbotQuestion('What languages?');
  assert.deepEqual(bodies[1].history, [
    { role: 'user', content: 'What does he do?' },
    { role: 'assistant', content: 'He builds websites.' }
  ]);
});
test('failed replies do not enter history and the same question can be retried', async () => {
  let calls = 0;
  const { context, messages } = setup(async () => {
    calls++;
    return calls === 1 ? Response.json({ error: 'AI_UNAVAILABLE' }, { status: 503 }) : Response.json({ answer: 'Hello!' });
  });
  await context.sendChatbotQuestion('hi');
  assert.equal(context.conversationHistory.length, 0);
  assert.match(messages[1].text, /temporarily unavailable/);
  await context.sendChatbotQuestion('hi');
  assert.equal(calls, 2);
  assert.equal(context.conversationHistory.length, 2);
});
test('language changes make a new request rather than reuse an old cached answer', async () => {
  const languages = [];
  const { context } = setup(async (_url, init) => {
    languages.push(JSON.parse(init.body).language);
    return Response.json({ answer: 'A reply.' });
  });
  await context.sendChatbotQuestion('hi');
  context.currentLanguage = 'fr';
  await context.sendChatbotQuestion('hi');
  assert.deepEqual(languages, ['en', 'fr']);
});
test('network failures are localized and release the pending state', async () => {
  const { context, messages } = setup(async () => { throw new Error('offline'); });
  context.currentLanguage = 'fr';
  await context.sendChatbotQuestion('bonjour');
  assert.match(messages[1].text, /temporairement indisponible/);
  assert.equal(context.chatRequestPending, false);
  assert.equal(context.conversationHistory.length, 0);
});
