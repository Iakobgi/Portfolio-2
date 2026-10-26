const header = document.getElementById("header");
const navbar = document.getElementById("navbar");
const menuToggle = document.getElementById("menu-toggle");
const themeToggle = document.getElementById("theme-toggle");

const skillsList = document.getElementById("skills-list");

const heroName = document.getElementById("hero-name");
const heroTitle = document.getElementById("hero-title");
const heroSummary = document.getElementById("hero-summary");
const terminalText = document.getElementById("terminal-text");

const aboutMyself = document.getElementById("about-myself");
const aboutGoals = document.getElementById("about-goals");
const aboutInterests = document.getElementById("about-interests");

const linkedinLink = document.getElementById("linkedin-link");
const githubLink = document.getElementById("github-link");

const contactEmail = document.getElementById("contact-email");
const contactLinkedin = document.getElementById("contact-linkedin");
const contactLocation = document.getElementById("contact-location");

const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");
const formSubmit = document.getElementById("form-submit");
const formFilename = document.getElementById("form-filename");
const formFirstNameInput = document.getElementById("form-first-name");
const formLastNameInput = document.getElementById("form-last-name");
const formEmailInput = document.getElementById("form-email");
const formPhoneInput = document.getElementById("form-phone");
const formRoleInput = document.getElementById("form-role");
const formCityInput = document.getElementById("form-city");
const formSubjectInput = document.getElementById("form-subject");
const formMessageInput = document.getElementById("form-message");

const footerText = document.getElementById("footer-text");
const footerEmail = document.getElementById("footer-email");
const footerLinkedin = document.getElementById("footer-linkedin");
const footerGithub = document.getElementById("footer-github");

const projectsTrack = document.getElementById("projects-track");
const projectsPrev = document.getElementById("projects-prev");
const projectsNext = document.getElementById("projects-next");

const chatbotToggle = document.getElementById("chatbot-toggle");
const chatbotWindow = document.getElementById("chatbot-window");
const chatbotClose = document.getElementById("chatbot-close");
const chatbotForm = document.getElementById("chatbot-form");
const chatbotInput = document.getElementById("chatbot-input");
const chatbotBody = document.getElementById("chatbot-body");
const chatbotToast = document.getElementById("chatbot-toast");
const chatbotToastClose = document.getElementById("chatbot-toast-close");

let portfolioData = null;
let currentLanguage = "fr";
let conversationHistory = []; // last 2 successful exchanges, as role/content messages
let chatRequestPending = false;
let chatbotHintTimer = null;
let chatbotSpotlightTimer = null;
let chatbotHideTimer = null;
let chatbotGlowTimer = null;
let terminalTimer = null;
let terminalRunId = 0;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const languageFiles = {
    fr: "data-francais.json",
    en: "data-english.json"
};

if (menuToggle && navbar) {
    menuToggle.addEventListener("click", () => {
        const isOpen = navbar.classList.toggle("active");
        document.body.classList.toggle("menu-open", isOpen);
    });
}

document.addEventListener("click", (event) => {
    if (!navbar || !navbar.classList.contains("active")) return;
    const clickedInsideMenu = navbar.contains(event.target);
    const clickedToggle = menuToggle && menuToggle.contains(event.target);
    if (!clickedInsideMenu && !clickedToggle) {
        navbar.classList.remove("active");
        document.body.classList.remove("menu-open");
    }
});

function applyTheme(theme) {
    if (theme === "light") {
        document.documentElement.setAttribute("data-theme", "light");
    } else {
        document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem("theme", theme);
}

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const isLight = document.documentElement.getAttribute("data-theme") === "light";
        applyTheme(isLight ? "dark" : "light");
    });
}

document.querySelectorAll(".navbar a").forEach((link) => {
    link.addEventListener("click", () => {
        if (navbar) navbar.classList.remove("active");
        document.body.classList.remove("menu-open");
    });
});

function updateActiveNavigation() {
    if (!navbar) return;
    const links = [...navbar.querySelectorAll("a")];
    const sections = links.map((link) => {
        const url = new URL(link.href, window.location.href);
        return url.pathname === window.location.pathname && url.hash
            ? document.getElementById(url.hash.slice(1)) : null;
    }).filter(Boolean);
    let active = sections[0];
    sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= 160) active = section;
    });
    links.forEach((link) => {
        const url = new URL(link.href, window.location.href);
        const onProjectPage = document.body.hasAttribute("data-project-index");
        const selected = onProjectPage ? url.hash === "#projects"
            : active ? url.pathname === window.location.pathname && url.hash === `#${active.id}`
            : !url.hash && url.pathname === window.location.pathname;
        if (selected) link.setAttribute("aria-current", active && !onProjectPage ? "location" : "page");
        else link.removeAttribute("aria-current");
    });
}

window.addEventListener("scroll", () => {
    revealOnScroll();
    updateActiveNavigation();

    if (header) {
        if (window.scrollY > 40) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    }
});

window.addEventListener("load", () => { revealOnScroll(); updateActiveNavigation(); });

function revealOnScroll() {
    const elements = document.querySelectorAll(".reveal");

    elements.forEach((element) => {
        const top = element.getBoundingClientRect().top;
        if (top < window.innerHeight - 100) {
            element.classList.add("active");
        }
    });
}

function getNestedValue(object, path) {
    return path.split(".").reduce((value, key) => {
        if (value && Object.prototype.hasOwnProperty.call(value, key)) {
            return value[key];
        }
        return "";
    }, object);
}

function applyStaticTranslations(data) {
    document.querySelectorAll("[data-i18n]").forEach((element) => {
        const value = getNestedValue(data, element.dataset.i18n);

        if (value !== undefined && value !== null && value !== "") {
            element.textContent = value;
        }
    });

    if (chatbotToast && sessionStorage.getItem("chatbotHintDismissed") !== "true") {
        chatbotToast.setAttribute("aria-hidden", "false");
    }

    const title = document.getElementById("page-title");
    if (title && data.ui?.siteTitle) {
        title.textContent = data.ui.siteTitle;
        document.title = data.ui.siteTitle;
    }

    if (chatbotInput && data.ui?.chatbot?.placeholder) {
        chatbotInput.placeholder = data.ui.chatbot.placeholder;
    }

    if (formFilename && data.ui?.contactForm?.filename) {
        formFilename.textContent = data.ui.contactForm.filename;
    }

    const contactJsonFilename = document.getElementById("contact-json-filename");
    if (contactJsonFilename && data.ui?.contactPage?.cardTitle) {
        contactJsonFilename.textContent = data.ui.contactPage.cardTitle;
    }

    document.documentElement.lang = currentLanguage === "fr" ? "fr" : "en";
}

/* ---------------------------------------------------------------------- */
/*  Hero terminal typing effect                                           */
/* ---------------------------------------------------------------------- */
function buildTerminalLines(data) {
    const { personal, apprenticeship, skills } = data;
    const topSkills = skills.technical.slice(0, 5).join(", ");

    return [
        { cmd: "whoami", out: personal.name },
        { cmd: "cat status.txt", out: apprenticeship.availability },
        { cmd: "ls skills/", out: topSkills },
        { cmd: "echo $LOCATION", out: personal.location }
    ];
}

async function typeLine(text, speed) {
    if (!terminalText) return;
    for (let i = 0; i <= text.length; i += 1) {
        terminalText.textContent = text.slice(0, i);
        await wait(speed);
    }
}

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTerminalSequence(lines, runId) {
    if (!terminalText) return;
    const outputEl = document.getElementById("terminal-output");

    for (const line of lines) {
        if (runId !== terminalRunId) return;

        if (outputEl) outputEl.textContent = "";
        await typeLine(line.cmd, 45);
        await wait(400);

        if (runId !== terminalRunId) return;
        if (outputEl) outputEl.innerHTML = `&gt; ${line.out}`;

        await wait(1600);
        if (runId !== terminalRunId) return;

        terminalText.textContent = "";
        await wait(200);
    }
}

function startTerminalTyping() {
    if (!terminalText || !portfolioData) return;

    terminalRunId += 1;
    const runId = terminalRunId;
    const lines = buildTerminalLines(portfolioData);
    const outputEl = document.getElementById("terminal-output");

    clearTimeout(terminalTimer);

    if (prefersReducedMotion) {
        terminalText.textContent = lines[0].cmd;
        if (outputEl) outputEl.innerHTML = `&gt; ${lines[0].out}`;
        return;
    }

    runTerminalSequence(lines, runId).then(() => {
        if (runId === terminalRunId) {
            terminalTimer = setTimeout(() => startTerminalTyping(), 400);
        }
    });
}

function showChatbotHint() {
    if (!chatbotToast || sessionStorage.getItem("chatbotHintDismissed") === "true") return;

    chatbotToast.classList.add("visible");
    chatbotToast.setAttribute("aria-hidden", "false");

    clearTimeout(chatbotHideTimer);
    chatbotHideTimer = setTimeout(() => {
        hideChatbotHint();
    }, 6000);
}

function hideChatbotHint() {
    if (!chatbotToast) return;

    chatbotToast.classList.remove("visible");
    chatbotToast.setAttribute("aria-hidden", "true");
    clearTimeout(chatbotHideTimer);
}

function startChatbotSpotlight() {
    if (!chatbotToggle) return;

    chatbotToggle.classList.add("chatbot-spotlight");

    clearTimeout(chatbotGlowTimer);
    chatbotGlowTimer = setTimeout(() => {
        if (chatbotToggle) {
            chatbotToggle.classList.remove("chatbot-spotlight");
        }
    }, 11000);
}

function scheduleChatbotHint() {
    if (chatbotHintTimer) {
        return;
    }

    chatbotHintTimer = setTimeout(() => {
        showChatbotHint();
    }, 3000);
}

function scheduleChatbotSpotlight() {
    if (chatbotSpotlightTimer) {
        return;
    }

    chatbotSpotlightTimer = setTimeout(() => {
        startChatbotSpotlight();
    }, 3000);
}

async function changeLanguage(lang) {
    try {
        currentLanguage = lang;
        localStorage.setItem("language", lang);

        document.querySelectorAll(".language-switcher img").forEach((img) => {
            img.classList.toggle("active", img.alt.toLowerCase().startsWith(lang === "fr" ? "fran" : "eng"));
        });

        const response = await fetch(languageFiles[lang]);

        if (!response.ok) {
            throw new Error(`Unable to load ${languageFiles[lang]}`);
        }

        portfolioData = await response.json();

        applyStaticTranslations(portfolioData);
        fillIndexPage();
        fillProjectPage();
        fillFooter();
        fillContactPage();
        startTerminalTyping();
    } catch (error) {
        console.error("Language loading error:", error);
    }
}

async function getAIReply(question, language = currentLanguage) {
    const unavailable = language === "fr"
        ? "L'assistant IA est temporairement indisponible. Veuillez réessayer dans un instant."
        : "The AI assistant is temporarily unavailable. Please try again shortly.";
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 35000);
    try {
        const response = await fetch("https://portfolio-ai.iakobi.workers.dev/chat", {
            method: "POST",
            signal: controller.signal,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: question, language, history: conversationHistory })
        });
        const data = await response.json();
        if (!response.ok || data.error || typeof data.answer !== "string" || !data.answer.trim()) {
            return { ok: false, answer: unavailable };
        }
        return { ok: true, answer: data.answer };
    } catch {
        return { ok: false, answer: unavailable };
    } finally {
        clearTimeout(timer);
    }
}

function fillIndexPage() {
    if (!portfolioData || !heroName) return;

    const { personal, apprenticeship, skills, interests, projects, ui } = portfolioData;
    document.querySelector(".hero-facts")?.setAttribute("aria-label", ui.heroFactsLabel);

    heroName.textContent = personal.name;
    heroTitle.textContent = personal.title;
    heroSummary.textContent = personal.summary;

    if (aboutMyself) aboutMyself.textContent = personal.myself
    if (aboutGoals) aboutGoals.textContent = `${apprenticeship.status} ${apprenticeship.goals}`;
    if (aboutInterests) aboutInterests.textContent = interests.join(", ") + ".";

    if (linkedinLink) linkedinLink.href = personal.linkedin;
    if (githubLink) githubLink.href = personal.github;

    if (contactEmail) {
        contactEmail.href = `mailto:${personal.email}`;
        const span = contactEmail.querySelector("span");
        if (span) span.textContent = personal.email;
    }

    if (contactLinkedin) {
        contactLinkedin.href = personal.linkedin;
    }

    if (contactLocation) {
        const span = contactLocation.querySelector("span");
        if (span) span.textContent = personal.location;
    }

    renderSkillsSection(skills, ui);
    renderProjectCards(projects, ui);
}

function fillFooter() {
    if (!portfolioData) return;
    const { personal } = portfolioData;

    if (footerText) footerText.textContent = `© 2026 ${personal.name} - ${personal.title}`;
    if (footerEmail) footerEmail.href = `mailto:${personal.email}`;
    if (footerLinkedin) footerLinkedin.href = personal.linkedin;
    if (footerGithub) footerGithub.href = personal.github;
}

function fillContactPage() {
    if (!portfolioData) return;
    const { personal, apprenticeship } = portfolioData;

    if (contactEmail) {
        contactEmail.href = `mailto:${personal.email}`;
        const span = contactEmail.querySelector("span");
        if (span) span.textContent = personal.email;
    }

    if (contactLinkedin) {
        contactLinkedin.href = personal.linkedin;
    }

    if (contactLocation) {
        const span = contactLocation.querySelector("span");
        if (span) span.textContent = personal.location;
    }

    renderContactJSON(personal, apprenticeship);
}

function renderContactJSON(personal, apprenticeship) {
    const el = document.getElementById("contact-json");
    if (!el) return;

    const rows = [
        ["name", personal.name],
        ["role", personal.title],
        ["location", personal.location],
        ["email", personal.email],
        ["availability", apprenticeship.availability]
    ];

    const body = rows
        .map(([key, value], index) => {
            const comma = index < rows.length - 1 ? "," : "";
            return `  <span class="json-key">"${key}"</span><span class="json-punct">:</span> <span class="json-string">"${value}"</span><span class="json-punct">${comma}</span>`;
        })
        .join("\n");

    el.innerHTML = `<span class="json-punct">{</span>\n${body}\n<span class="json-punct">}</span>`;
}

function renderSkillsSection(skills, ui) {
    if (!skillsList) return;

    // Match translated data to stable skill names so both languages show the same skills.
    const skillAliases = {
        "JavaScript ES6+": "JavaScript",
        "PHP 8": "PHP",
        "Symfony 7": "Symfony",
        "UML 2": "UML",
        "PHPUnit 10": "PHPUnit",
        "Tests unitaires": "Unit testing",
        "API REST": "REST APIs",
        "Déploiement cloud": "Cloud deployment",
        "Intégration d'API IA": "AI API Integration",
        "Pipelines RAG": "RAG Pipelines",
        "APIs LLM": "LLM APIs",
        "Orchestration LLM": "LLM orchestration",
        "Agents IA avancés": "Advanced AI agents",
    };
    const skillLookup = new Map([
        ...skills.technical,
        ...skills.learning,
        ...skills.soft
    ].map((skill) => [skillAliases[skill] || skill, skill]));

    // Explicit self-assessments; skills without a supplied level remain neutral.
    const skillLevels = Object.fromEntries(
        Object.entries(skills.levels || {}).map(([skill, level]) => [skillAliases[skill] || skill, level])
    );
    const levelLabels = skills.levelDescriptions;
    const legend = `
        <div class="skills-legend" aria-label="${currentLanguage === "fr" ? "Légende des niveaux" : "Skill level legend"}">
            <span class="skills-legend-item"><span class="skills-legend-swatches" aria-hidden="true"><i class="skill-swatch skill-level-practicing"></i><i class="skill-swatch skill-level-beginner"></i></span>${currentLanguage === "fr" ? "En apprentissage" : "Learning"}</span>
            <span class="skills-legend-item"><span class="skills-legend-swatches" aria-hidden="true"><i class="skill-swatch skill-level-familiar"></i><i class="skill-swatch skill-level-confident"></i></span>${currentLanguage === "fr" ? "Acquis" : "Known"}</span>
        </div>`;
    const renderSkill = (skill) => {
        const label = skill === "JSON" ? "JSON (format)" : skillLookup.get(skill);
        const level = skillLevels[skill];
        if (!level) return `<span class="skill card">${label}</span>`;
        return `<span class="skill card skill-rated skill-level-${level}" tabindex="0" aria-label="${label}: ${levelLabels[level]}">${label}<span class="skill-level-tip" aria-hidden="true">${levelLabels[level]}</span></span>`;
    };

    const commonLabels = currentLanguage === "fr"
        ? {
            frontend: "Web & Applications",
            backend: "Backend & Logiciel",
            databases: "Bases de données",
            ai: "IA & Données",
            devops: "Cloud & DevOps",
            systems: "Outils de développement",
            mindset: "Savoir-être"
        }
        : {
            frontend: "Web & Applications",
            backend: "Backend & Software",
            databases: "Databases",
            ai: "AI & Data",
            devops: "Cloud & DevOps",
            systems: "Development Workflow",
            mindset: "Soft Skills"
        };

    const skillGroups = [
        {
            id: "frontend",
            icon: "fa-display",
            label: ui.skills?.groups?.frontend || commonLabels.frontend,
            description: currentLanguage === "fr"
                ? "Interfaces, frameworks UI et applications multiplateformes"
                : "Interfaces, UI frameworks, and cross-platform apps",
            skills: ["HTML/CSS", "JavaScript", "TypeScript", "React", "Angular", "Flutter", "Dart", "UI/UX"]
        },
        {
            id: "backend",
            icon: "fa-server",
            label: ui.skills?.groups?.backend || commonLabels.backend,
            description: currentLanguage === "fr"
                ? "Développement logiciel, logique applicative et API"
                : "Software development, application logic, and APIs",
            skills: ["Python", "C++", "PHP", "Node.js", "Symfony", "FastAPI", "REST APIs", "Sequelize"]
        },
        {
            id: "databases",
            icon: "fa-database",
            label: ui.skills?.groups?.databases || commonLabels.databases,
            description: currentLanguage === "fr"
                ? "SQL et NoSQL, bases relationnelles et non relationnelles"
                : "SQL and NoSQL, relational and non-relational databases",
            skills: ["SQL", "NoSQL", "PostgreSQL", "MySQL", "MariaDB", "Supabase", "MongoDB", "JSON", "phpMyAdmin", "PL/SQL"]
        },
        {
            id: "ai",
            icon: "fa-robot",
            label: ui.skills?.groups?.ai || commonLabels.ai,
            description: currentLanguage === "fr"
                ? "Intégration de modèles IA, pipelines RAG et outils de données"
                : "AI model integration, RAG pipelines, and data tools",
            skills: ["Python", "AI API Integration", "Hugging Face", "OpenRouter", "Scikit-learn", "Google Colab", "RAG Pipelines", "LLM APIs", "LLM orchestration", "Advanced AI agents", "LangChain", "pgvector"]
        },
        {
            id: "devops",
            icon: "fa-cloud",
            label: ui.skills?.groups?.devops || commonLabels.devops,
            description: currentLanguage === "fr"
                ? "Gestion de versions, conteneurisation, déploiement et automatisation"
                : "Version control, containerization, deployment, and automation",
            skills: ["Docker", "Linux", "Bash", "CI/CD", "Cloud deployment", "Cloudflare", "Oracle Cloud", "Netlify", "Render", "Hostinger"]
        },
        {
            id: "systems",
            icon: "fa-microchip",
            label: ui.skills?.groups?.systems || commonLabels.systems,
            description: currentLanguage === "fr"
                ? "Gestion de versions, éditeurs, modélisation et tests navigateur"
                : "Version control, editors, modeling, and browser testing",
            skills: ["Git", "GitHub", "Visual Studio Code", "Qt Creator", "UML", "Playwright", "Unit testing", "PHPUnit", "Agile"]
        },
        {
            id: "mindset",
            icon: "fa-lightbulb",
            label: ui.skills?.groups?.mindset || commonLabels.mindset,
            description: currentLanguage === "fr"
                ? "Approche de travail, curiosité et esprit d’équipe"
                : "Work approach, curiosity, and teamwork",
            skills: skills.soft
        }

    ].map((group) => ({
        ...group,
        skills: group.skills.filter((skill) => skillLookup.has(skill))
    })).filter((group) => group.skills.length > 0);

    const fr = currentLanguage === "fr";
    const row = (labelFr, labelEn, items, leadSkills = [], caption = "") => ({
        label: fr ? labelFr : labelEn, items, leadSkills, caption
    });
    const skillRows = {
        frontend: [
            row("Langages", "Languages", ["HTML/CSS", "JavaScript", "TypeScript", "Dart"]),
            row("Frameworks", "Frameworks", ["React", "Angular", "Flutter"]),
            row("Design", "Design", ["UI/UX"])
        ],
        backend: [
            row("Langages", "Languages", ["Python", "C++", "PHP"]),
            row("Environnement", "Runtime", ["Node.js"]),
            row("Accès aux données", "Data Access", ["Sequelize"]),
            row("Frameworks & API", "Frameworks & APIs", ["Symfony", "FastAPI", "REST APIs"])
        ],
        databases: [
            row("SQL", "SQL", ["PostgreSQL", "MySQL", "MariaDB", "Supabase"]),
            row("NoSQL", "NoSQL", ["MongoDB", "JSON"]),
            row("Administration", "Administration", ["phpMyAdmin"]),
            row("Scripts SQL", "SQL Scripting", ["PL/SQL"])
        ],
        ai: [
            row("Langage", "Language", ["Python"]),
            row("API & modèles", "APIs & Models", ["LLM APIs", "OpenRouter", "Hugging Face", "AI API Integration"]),
            row("IA & données", "AI & Data", ["Scikit-learn", "Google Colab"]),
            row("RAG", "RAG", ["RAG Pipelines", "LangChain", "pgvector"]),
            row("Architecture IA", "AI Architecture", ["LLM orchestration", "Advanced AI agents"])
        ],
        devops: [
            row("Système & scripts", "System & Scripting", ["Linux", "Bash"]),
            row("Automatisation", "Automation", ["Docker", "CI/CD"]),
            row("Cloud & hébergement", "Cloud & Hosting", ["Cloud deployment", "Cloudflare", "Oracle Cloud", "Netlify", "Render", "Hostinger"])
        ],
        systems: [
            row("Gestion de versions", "Version Control", ["Git", "GitHub"]),
            row("Éditeurs & IDE", "Editors & IDEs", ["Visual Studio Code", "Qt Creator"]),
            row("Modélisation", "Modeling", ["UML"]),
            row("Tests navigateur", "Browser Testing", ["Playwright"]),
            row("Tests unitaires", "Unit Testing", ["Unit testing", "PHPUnit"]),
            row("Gestion de projet", "Project Management", ["Agile"])
        ]
    };
    const renderSkillRows = (group) => {
        if (!skillRows[group.id]) return `<div class="skills-pills">${group.skills.map(renderSkill).join("")}</div>`;
        return `<div class="competency-rows">${skillRows[group.id].map((entry) => ({
            ...entry, items: entry.items.filter((skill) => group.skills.includes(skill))
        })).filter((entry) => entry.items.length).map((entry) => `
            <div class="competency-row">
                <div class="competency-row-label">${entry.leadSkills.length ? entry.leadSkills.map(renderSkill).join("") : entry.label}</div>
                <span class="competency-row-divider" aria-hidden="true"></span>
                <div class="competency-row-content" role="group" aria-label="${entry.caption || entry.label}">
                    ${entry.caption ? `<span class="competency-row-caption">${entry.caption}</span>` : ""}
                    <div class="skills-pills">${entry.items.map(renderSkill).join("")}</div>
                </div>
            </div>`).join("")}</div>`;
    };

    const firstGroupId = skillGroups[0]?.id || "";

    skillsList.innerHTML = `
        <div class="skills-tab-list" role="tablist" aria-label="Skill groups">
            ${skillGroups.map((group) => `
                <button
                    type="button"
                    class="skills-tab ${group.id === firstGroupId ? "active" : ""}"
                    data-group="${group.id}"
                    role="tab"
                    aria-selected="${group.id === firstGroupId}"
                >
                    <i class="fa-solid ${group.icon}"></i>
                    <span>${group.label}</span>
                </button>
            `).join("")}
        </div>

        <div class="skills-panels">
            ${skillGroups.map((group) => `
                <article
                    class="skills-group-panel ${group.id === firstGroupId ? "active" : ""}"
                    data-group-panel="${group.id}"
                >
                    <div class="skills-group-header">
                        <div>
                            <h3 class="skills-group-title">${group.label}</h3>
                            <p class="skills-group-description">${group.description}</p>
                        </div>
                        ${group.id !== "mindset" ? legend : ""}
                    </div>
                    ${renderSkillRows(group)}
                </article>
            `).join("")}
        </div>
    `;

    skillsList.querySelectorAll(".skills-tab").forEach((button) => {
        button.addEventListener("click", () => {
            const targetGroup = button.dataset.group;

            skillsList.querySelectorAll(".skills-tab").forEach((tab) => {
                tab.classList.toggle("active", tab.dataset.group === targetGroup);
                tab.setAttribute("aria-selected", String(tab.dataset.group === targetGroup));
            });

            skillsList.querySelectorAll(".skills-group-panel").forEach((panel) => {
                panel.classList.toggle("active", panel.dataset.groupPanel === targetGroup);
            });
        });
    });
}

// Keep card and detail-page images aligned with the selected language.
const projectImages = [
    { fr: "project-portfolio-fr.webp", en: "project-portfolio-en.webp" },
    { fr: "project-ext-fr.webp", en: "project-ext-en.webp" },
    { fr: "project-ai-fr.webp", en: "project-ai-en.webp" },
    { fr: "project-fiverr-fr.webp", en: "project-fiverr-en.webp" },
    { fr: "project-seogeo-fr.webp", en: "project-seo-geo-en.webp" },
    { fr: "project-serre-fr.webp", en: "project-serre-en.webp" },
    { fr: "project-mistral-fr.webp", en: "project-mistral-en.webp" }
];

function getProjectImage(index) {
    return projectImages[index][currentLanguage];
}

function renderProjectCards(projects, ui) {
    if (!projectsTrack || !projects) return;

    const links = ["project1.html", "project2.html", "project3.html", "project4.html", "project5.html", "project6.html", "project7.html"];
    const fileNames = ["portfolio.jsx", "extension.js", "chatbot.py", "client-site.html", "dashboard.ts", "greenhouse.cpp", "local-ai.md"];
    const tagSets = currentLanguage === "fr"
        ? [
            ["Web", "Portfolio"],
            ["Confidentialité", "Extension"],
            ["IA", "Chatbot"],
            ["Freelance", "Site web", "Fiverr"],
            ["IA", "SEO", "GEO"], ["Académique", "IoT", "C++"], ["Stage", "IA locale"]
        ]
        : [
            ["Web", "Portfolio"],
            ["Privacy", "Extension"],
            ["AI", "Chatbot"],
            ["Freelance", "Website", "Fiverr"],
            ["AI", "SEO", "GEO"], ["Academic", "IoT", "C++"], ["Internship", "Local AI"]
        ];

    projectsTrack.innerHTML = "";

    // Feature completed client work while preserving each project's original assets and URL.
    [3, 4, 0, 2, 1, 5, 6].forEach((index) => {
        const project = projects[index];
        if (!project) return;
        const card = document.createElement("a");
        card.href = links[index];
        card.className = "project-card";

        card.innerHTML = `
            <div class="card-chrome">
                <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
                <span class="card-filename">${fileNames[index]}</span>
            </div>
            <div class="project-image-wrap">
                <img src="${getProjectImage(index)}" alt="${project.name}" loading="lazy" decoding="async" />
            </div>
            <div class="project-content">
                <div class="project-tags">
                    ${tagSets[index].map((tag) => `<span>${tag}</span>`).join("")}
                </div>
                <h3>${project.name}</h3>
                <p class="project-period">${project.period}</p>
                <p>${project.shortDescription}</p>
                <span class="project-link-text">
                    ${ui.projects.seeDetails} <i class="fa-solid fa-arrow-right"></i>
                </span>
            </div>
        `;

        projectsTrack.appendChild(card);
    });

    projectsTrack.scrollLeft = 0;
}

function renderProjectSwitcher(activeIndex) {
    const host = document.getElementById("project-switcher");
    if (!host) return;
    const fr = currentLanguage === "fr";
    const order = [3, 4, 0, 2, 1, 5, 6];
    const position = order.indexOf(activeIndex);
    const previous = order[(position + order.length - 1) % order.length];
    const next = order[(position + 1) % order.length];
    const shortLabels = fr
        ? ["Portfolio", "Extension", "Assistant IA", "Site client", "SEO/GEO", "Serre", "Mistral/Mixtral"]
        : ["Portfolio", "Extension", "AI Assistant", "Client Website", "SEO/GEO", "Greenhouse", "Mistral/Mixtral"];
    host.innerHTML = `<nav class="project-picker" aria-label="${fr ? "Choisir un projet" : "Choose a project"}">
        <a class="project-picker-arrow" href="project${previous + 1}.html" aria-label="${fr ? "Projet précédent" : "Previous project"}">‹</a>
        <details class="project-picker-menu">
            <summary><span class="project-picker-label">${fr ? "Projet" : "Project"} ${String(position + 1).padStart(2, "0")}</span></summary>
            <div class="project-picker-popup">
                <button type="button" class="project-picker-scroll" data-direction="-1" aria-label="${fr ? "Défiler à gauche" : "Scroll left"}">‹</button>
                <div class="project-picker-options">
                ${order.map((index, number) => `<a href="project${index + 1}.html"${index === activeIndex ? ' aria-current="page"' : ''}><span class="project-picker-number">${String(number + 1).padStart(2, "0")}</span><span title="${portfolioData.projects[index].name}">${shortLabels[index]}</span>${index === activeIndex ? '<span aria-hidden="true">✓</span>' : ''}</a>`).join("")}
                </div>
                <button type="button" class="project-picker-scroll" data-direction="1" aria-label="${fr ? "Défiler à droite" : "Scroll right"}">›</button>
            </div>
        </details>
        <a class="project-picker-arrow" href="project${next + 1}.html" aria-label="${fr ? "Projet suivant" : "Next project"}">›</a>
    </nav>`;
    const menu = host.querySelector("details");
    const options = host.querySelector(".project-picker-options");
    const popup = host.querySelector(".project-picker-popup");
    const updateOverflow = () => {
        popup.classList.toggle("has-overflow", options.scrollWidth > options.clientWidth + 1);
        host.querySelector('[data-direction="-1"]').disabled = options.scrollLeft <= 1;
        host.querySelector('[data-direction="1"]').disabled = options.scrollLeft + options.clientWidth >= options.scrollWidth - 1;
    };
    host.querySelectorAll(".project-picker-scroll").forEach((button) => {
        button.addEventListener("click", () => options.scrollBy({
            left: Number(button.dataset.direction) * options.clientWidth * 0.7,
            behavior: prefersReducedMotion ? "instant" : "smooth"
        }));
    });
    options.addEventListener("wheel", (event) => {
        if (event.ctrlKey || options.scrollWidth <= options.clientWidth) return;
        const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
        if (!delta) return;
        event.preventDefault();
        options.scrollLeft += delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? options.clientWidth : 1);
    }, { passive: false });
    options.addEventListener("scroll", updateOverflow, { passive: true });
    host.projectPickerObserver?.disconnect();
    host.projectPickerObserver = new ResizeObserver(updateOverflow);
    host.projectPickerObserver.observe(options);
    menu.addEventListener("toggle", () => {
        if (menu.open) requestAnimationFrame(() => {
            updateOverflow();
            const active = options.querySelector('[aria-current="page"]');
            if (active) options.scrollLeft = active.offsetLeft - (options.clientWidth - active.offsetWidth) / 2;
            updateOverflow();
        });
    });
    host.onkeydown = (event) => {
        if (event.key === "Escape") {
            menu.open = false;
            menu.querySelector("summary").focus();
        }
    };
    // Replace the previous outside-click listener when changing languages.
    host.projectPickerCleanup?.();
    const closeOutside = (event) => { if (!host.contains(event.target)) menu.open = false; };
    document.addEventListener("click", closeOutside);
    host.projectPickerCleanup = () => document.removeEventListener("click", closeOutside);
    host.onfocusout = (event) => { if (!host.contains(event.relatedTarget)) menu.open = false; };
}

function fillProjectPage() {
    if (!portfolioData) return;

    const projectPage = document.querySelector("[data-project-index]");
    if (!projectPage) return;

    const index = Number(projectPage.dataset.projectIndex);
    const data = portfolioData.projectPages?.[index];

    if (!data) return;

    const setText = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    };

    renderProjectSwitcher(index);
    setText("project-eyebrow", data.eyebrow);
    setText("project-title", data.title);
    setText("project-subtitle", data.subtitle);
    setText("project-period", data.period);
    setText("project-description-title", data.descriptionTitle);
    setText("project-description", data.description);
    setText("project-technologies-title", data.technologiesTitle);
    setText("project-technologies", data.technologies);
    setText("project-learned-title", data.learnedTitle);
    setText("project-learned", data.learned);

    document.title = `${data.title} - Portfolio`;
    const viewDoc = document.getElementById("view-documentation-button");
    const downloadDoc = document.getElementById("download-documentation-button");
    if (viewDoc) viewDoc.textContent = portfolioData.ui.buttons.viewDocumentation;
    if (downloadDoc) downloadDoc.textContent = portfolioData.ui.buttons.downloadDocumentation;
    setText("documentation-title", portfolioData.ui.projects.documentationTitle);
    setText("documentation-fallback", portfolioData.ui.projects.documentationFallback);
    const docFrame = document.getElementById("documentation-frame");
    if (docFrame) docFrame.setAttribute("aria-label", portfolioData.ui.projects.documentationTitle);
    setText("documentation-language-notice", portfolioData.ui.projects.documentationLanguageNotice);
    const documentation = portfolioData.projects?.[index]?.documentation;
    if (docFrame && documentation) {
        const pdfUrl = documentation.pdfUrl.replace("https://iakob.netlify.app/", "");
        if (downloadDoc) downloadDoc.href = pdfUrl;
        const fallbackLink = document.getElementById("documentation-fallback");
        if (fallbackLink) fallbackLink.href = pdfUrl;
        const cover = docFrame.querySelector("img");
        if (cover) {
            const folder = index === 5 ? "greenhouse" : "local-ai";
            cover.src = `documents/${folder}/page-1-${currentLanguage}.webp`;
            cover.alt = currentLanguage === "fr" ? "Introduction de la documentation" : "Documentation introduction";
        }
    }


    const image = document.getElementById("project-image");
    if (image) {
        image.src = getProjectImage(index);
        image.alt = data.imageAlt;
    }

    const sourceButton = document.getElementById("source-code-button");
    if (sourceButton) sourceButton.textContent = portfolioData.ui.buttons.sourceCode;

    const previewButton = document.getElementById("live-preview-button");
    if (previewButton) previewButton.textContent = portfolioData.ui.buttons.livePreview;

    const comingButton = document.getElementById("coming-soon-button");
    if (comingButton) comingButton.textContent = portfolioData.ui.buttons.comingSoon;
}

function getScrollAmount() {
    if (!projectsTrack) return 300;

    const card = projectsTrack.querySelector(".project-card");
    if (!card) return 300;

    const gap = parseFloat(getComputedStyle(projectsTrack).columnGap) || 0;
    return card.getBoundingClientRect().width + gap;
}

if (projectsPrev && projectsTrack) {
    projectsPrev.addEventListener("click", () => {
        projectsTrack.scrollBy({
            left: -getScrollAmount(),
            behavior: "smooth"
        });
    });
}

if (projectsNext && projectsTrack) {
    projectsNext.addEventListener("click", () => {
        projectsTrack.scrollBy({
            left: getScrollAmount(),
            behavior: "smooth"
        });
    });
}

const liveDemoButton = document.getElementById("live-demo-button");
if (liveDemoButton && chatbotWindow) {
    liveDemoButton.addEventListener("click", () => {
        hideChatbotHint();
        chatbotWindow.classList.add("active");
        chatbotInput?.focus();
    });
}

if (chatbotToggle && chatbotWindow) {
    chatbotToggle.addEventListener("click", () => {
        hideChatbotHint();
        chatbotWindow.classList.toggle("active");
    });
}

if (chatbotClose && chatbotWindow) {
    chatbotClose.addEventListener("click", () => {
        chatbotWindow.classList.remove("active");
    });
}

// FIX: Toast close button now only closes the toast, does not open chatbot
if (chatbotToastClose) {
    chatbotToastClose.addEventListener("click", (event) => {
        event.stopPropagation(); // Prevent click from bubbling to the toast container
        hideChatbotHint();
        sessionStorage.setItem("chatbotHintDismissed", "true");
    });
}

if (chatbotToast) {
    chatbotToast.addEventListener("click", () => {
        if (chatbotWindow) {
            chatbotWindow.classList.add("active");
        }
        hideChatbotHint();
    });
}

function addMessage(text, type) {
    if (!chatbotBody) return;

    const message = document.createElement("div");
    message.className = type === "user" ? "user-message" : "bot-message";
    const paragraph = document.createElement("p");
    const content = String(text);
    if (type === "user") {
        paragraph.textContent = content;
    } else {
        let position = 0;
        for (const match of content.matchAll(/https?:\/\/[^\s<>]+/g)) {
            const url = match[0].replace(/[.,;:!?)\]}]+$/, "");
            paragraph.appendChild(document.createTextNode(content.slice(position, match.index)));
            const link = document.createElement("a");
            link.href = url;
            link.textContent = url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            paragraph.appendChild(link);
            position = match.index + url.length;
        }
        paragraph.appendChild(document.createTextNode(content.slice(position)));
    }
    message.appendChild(paragraph);
    chatbotBody.appendChild(message);
    chatbotBody.scrollTop = chatbotBody.scrollHeight;
}

function getBotReply(question) {
    if (!portfolioData) {
        return currentLanguage === "fr"
            ? "Les données du profil sont encore en chargement. Réessayez dans un instant."
            : "My profile data is still loading. Please try again in a second.";
    }

    const text = question.toLowerCase();
    const { personal, apprenticeship, skills, education, experience, projects, languages, interests, ui } = portfolioData;

    if (text.includes("name") || text.includes("nom") || text.includes("who are you") || text.includes("qui es")) {
        return `${personal.name} - ${personal.title}.`;
    }

    if (text.includes("about") || text.includes("summary") || text.includes("profile") || text.includes("profil") || text.includes("présentation")) {
        return personal.summary;
    }

    if (text.includes("email") || text.includes("contact") || text.includes("reach") || text.includes("contacter")) {
        return currentLanguage === "fr"
            ? `Vous pouvez contacter ${personal.name} à cette adresse : <a href="mailto:${personal.email}">${personal.email}</a>.`
            : `You can contact ${personal.name} at <a href="mailto:${personal.email}">${personal.email}</a>.`;
    }

    if (text.includes("linkedin")) {
        return currentLanguage === "fr"
            ? `Voici son profil LinkedIn : <a href="${personal.linkedin}" target="_blank">${personal.linkedin}</a>`
            : `Here is the LinkedIn profile: <a href="${personal.linkedin}" target="_blank">${personal.linkedin}</a>`;
    }

    if (text.includes("github")) {
        return currentLanguage === "fr"
            ? `Voici son GitHub : <a href="${personal.github}" target="_blank">${personal.github}</a>`
            : `Here is the GitHub profile: <a href="${personal.github}" target="_blank">${personal.github}</a>`;
    }

    if (text.includes("location") || text.includes("where") || text.includes("based") || text.includes("où") || text.includes("localisation")) {
        return currentLanguage === "fr"
            ? `${personal.name} est basé à ${personal.location}.`
            : `${personal.name} is based in ${personal.location}.`;
    }

    if (text.includes("apprenticeship") || text.includes("alternance") || text.includes("looking for") || text.includes("recherche")) {
        return `${apprenticeship.status} ${apprenticeship.goals}`;
    }

    if (text.includes("availability") || text.includes("available") || text.includes("disponible") || text.includes("disponibilité")) {
        return apprenticeship.availability;
    }

    if (text.includes("skill") || text.includes("technologies") || text.includes("tech stack") || text.includes("compétence") || text.includes("technos")) {
        return currentLanguage === "fr"
            ? `Compétences techniques : ${skills.technical.join(", ")}. En apprentissage : ${skills.learning.join(", ")}.`
            : `Technical skills: ${skills.technical.join(", ")}. Currently learning: ${skills.learning.join(", ")}.`;
    }

    if (text.includes("soft")) {
        return currentLanguage === "fr"
            ? `Qualités : ${skills.soft.join(", ")}.`
            : `Soft skills: ${skills.soft.join(", ")}.`;
    }

    if (text.includes("education") || text.includes("school") || text.includes("study") || text.includes("training") || text.includes("formation") || text.includes("école")) {
        const item = education[0];
        return `${item.degree} - ${item.school} (${item.year}). ${item.details}`;
    }

    if (text.includes("experience") || text.includes("work") || text.includes("expérience") || text.includes("travail")) {
        const item = experience[0];
        return `${item.role} - ${item.company} (${item.year}). ${item.details}`;
    }

    if (text.includes("project") || text.includes("built") || text.includes("projet")) {
        return currentLanguage === "fr"
            ? `Ses projets incluent : ${projects.map((project) => project.name).join(", ")}.`
            : `Projects include: ${projects.map((project) => project.name).join(", ")}.`;
    }

    if (text.includes("chrome") || text.includes("extension") || text.includes("tracker") || text.includes("cookie")) {
        const item = projects.find((project) =>
            project.name.toLowerCase().includes("extension") ||
            project.name.toLowerCase().includes("navigation") ||
            project.name.toLowerCase().includes("browsing")
        );
        if (item) return `${item.name}: ${item.description}`;
    }

    if (text.includes("portfolio")) {
        const item = projects.find((project) =>
            project.name.toLowerCase().includes("portfolio")
        );
        if (item) return `${item.name}: ${item.description}`;
    }

    if (text.includes("chatbot")) {
        const item = projects.find((project) =>
            project.name.toLowerCase().includes("chatbot")
        );
        if (item) return `${item.name}: ${item.description}`;
    }

    if (text.includes("language") || text.includes("langue")) {
        return currentLanguage === "fr"
            ? `Langues : ${languages.join(", ")}.`
            : `Languages: ${languages.join(", ")}.`;
    }

    if (text.includes("hobbies") || text.includes("interests") || text.includes("loisir") || text.includes("intérêt")) {
        return currentLanguage === "fr"
            ? `Centres d’intérêt : ${interests.join(", ")}.`
            : `Interests: ${interests.join(", ")}.`;
    }

    if (text.includes("cv") || text.includes("resume")) {
        return currentLanguage === "fr"
            ? `Vous pouvez télécharger le CV en haut de la page, ou <a href="cv.pdf" download>cliquer ici</a>.`
            : `You can download the CV at the top of the page, or <a href="cv.pdf" download>click here</a>.`;
    }

    if (text.includes("hire") || text.includes("why") || text.includes("recruter") || text.includes("pourquoi")) {
        return currentLanguage === "fr"
            ? `${personal.name} est motivé, curieux, et recherche une alternance pour progresser tout en contribuant à de vrais projets.`
            : `${personal.name} is motivated, curious, and currently looking for an apprenticeship where he can grow and contribute to real projects.`;
    }

    return ui?.chatbot?.fallback || "I do not have that exact information yet.";
}

function showTypingIndicator() {
    if (!chatbotBody) return;
    // Remove any existing typing indicator
    const existing = chatbotBody.querySelector(".typing-indicator");
    if (existing) existing.remove();

    const el = document.createElement("div");
    el.className = "typing-indicator";
    el.innerHTML = `
        <div class="typing-dots">
            <span></span><span></span><span></span>
        </div>
        <span class="typing-label">${currentLanguage === "fr" ? "Analyse" : "Thinking"}</span>
    `;
    chatbotBody.appendChild(el);
    chatbotBody.scrollTop = chatbotBody.scrollHeight;
}

function hideTypingIndicator() {
    if (!chatbotBody) return;
    const el = chatbotBody.querySelector(".typing-indicator");
    if (el) el.remove();
}

async function sendChatbotQuestion(question) {
    const cleanedQuestion = question.trim();
    if (!cleanedQuestion || chatRequestPending) return;
    chatRequestPending = true;
    const language = currentLanguage;
    addMessage(cleanedQuestion, "user");
    showTypingIndicator();
    if (chatbotInput) chatbotInput.value = "";
    try {
        const result = await getAIReply(cleanedQuestion, language);
        addMessage(result.answer, "bot");
        if (result.ok) {
            conversationHistory.push(
                { role: "user", content: cleanedQuestion },
                { role: "assistant", content: result.answer }
            );
            conversationHistory = conversationHistory.slice(-4);
        }
    } finally {
        hideTypingIndicator();
        chatRequestPending = false;
    }
}

if (chatbotForm && chatbotInput) {
    chatbotForm.addEventListener("submit", (event) => {
        event.preventDefault();
        sendChatbotQuestion(chatbotInput.value);
    });
}

function setFormStatus(text, type) {
    if (!formStatus) return;
    formStatus.textContent = text || "";
    formStatus.className = "form-status" + (type ? ` ${type}` : "");
}

function markFieldError(input, isError) {
    if (!input) return;
    input.classList.toggle("field-error", isError);
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
        const copy = portfolioData?.ui?.contactForm || {};
        const firstName = formFirstNameInput?.value.trim() || "";
        const lastName = formLastNameInput?.value.trim() || "";
        const email = formEmailInput?.value.trim() || "";
        const subject = formSubjectInput?.value.trim() || "";
        const message = formMessageInput?.value.trim() || "";

        const missing = !firstName || !lastName || !email || !subject || !message;
        markFieldError(formFirstNameInput, !firstName);
        markFieldError(formLastNameInput, !lastName);
        markFieldError(formEmailInput, !email);
        markFieldError(formSubjectInput, !subject);
        markFieldError(formMessageInput, !message);

        if (missing) {
            event.preventDefault();
            setFormStatus(copy.error || "Please fill in every required field before sending.", "error");
            return;
        }

        if (!isValidEmail(email)) {
            event.preventDefault();
            markFieldError(formEmailInput, true);
            setFormStatus(copy.errorInvalidEmail || "Please enter a valid email address.", "error");
            return;
        }

        // Validation passed: do not preventDefault. Let the browser submit the
        // form natively so Netlify can intercept and process it server-side,
        // then redirect to the form's `action` (thank-you.html). This avoids
        // every AJAX/fetch-related failure mode (redirect rules, content-type
        // quirks, etc.) that can break Netlify Forms on a live deployment.
        if (formSubmit) formSubmit.disabled = true;
        setFormStatus(copy.sending || "Sending…", "");
    });

    [
        formFirstNameInput,
        formLastNameInput,
        formEmailInput,
        formPhoneInput,
        formRoleInput,
        formCityInput,
        formSubjectInput,
        formMessageInput
    ].forEach((input) => {
        if (!input) return;
        input.addEventListener("input", () => markFieldError(input, false));
    });
}

document.querySelectorAll(".chatbot-suggestion").forEach((button) => {
    button.addEventListener("click", () => {
        sendChatbotQuestion(button.textContent.trim());
    });
});

async function alignInitialSection() {
    const id = window.location.hash.slice(1);
    const section = id && document.getElementById(id);
    if (!section) return;

    // The browser's first anchor jump happens before translated sections are filled.
    await document.fonts.ready;
    if (document.readyState !== "complete") {
        await new Promise((resolve) => window.addEventListener("load", resolve, { once: true }));
    }
    await new Promise((resolve) => requestAnimationFrame(resolve));
    // Respect navigation performed while the page was loading.
    if (window.location.hash.slice(1) !== id) return;
    section.scrollIntoView({ behavior: "instant", block: "start" });
    revealOnScroll();
}

document.addEventListener("DOMContentLoaded", async () => {
    scheduleChatbotHint();
    scheduleChatbotSpotlight();

    const savedLanguage = localStorage.getItem("language") || "fr";
    await changeLanguage(savedLanguage);
    await alignInitialSection();
    updateActiveNavigation();
});
