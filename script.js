let translations = {};
let currentLanguage = 'en';

// Load translations
async function loadTranslations() {
  try {
    const response = await fetch('translations.json');
    translations = await response.json();
    populateLanguageSelector();
    applyLanguage();
  } catch (error) {
    console.error('Error loading translations:', error);
  }
}

// Populate language selector
function populateLanguageSelector() {
  const languageSelect = document.getElementById('language-select');
  languageSelect.innerHTML = '';
  for (const lang in translations) {
    const option = document.createElement('option');
    option.value = lang;
    option.textContent = translations[lang]['language_name'];
    languageSelect.appendChild(option);
  }
}

// Apply language
function applyLanguage() {
  const savedLanguage = localStorage.getItem('language') || 'en';
  changeLanguage(savedLanguage);
}

// Change language
function changeLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem('language', lang);
  const texts = translations[lang];

  // Update interface text
  document.getElementById('title').textContent = texts['title'];
  document.getElementById('prompt').placeholder = texts['prompt_placeholder'];
  document.getElementById('copy-prompt-btn').textContent = texts['copy_prompt'];
  document.getElementById('clear-prompt-btn').textContent = texts['clear_prompt'];

  // Update theme toggle icon
  const currentTheme = document.documentElement.getAttribute('data-theme');
  document.getElementById('theme-toggle').textContent = currentTheme === 'dark' ? texts['switch_to_light'] : texts['switch_to_dark'];

  // Update language selector
  document.getElementById('language-select').value = lang;

  // Reload keywords to update language
  loadKeywords();
}

// Load keywords from language-specific JSON file
async function loadKeywords() {
  try {
    const response = await fetch(`keywords_${currentLanguage}.json`);
    const data = await response.json();
    displayDropdowns(data);
  } catch (error) {
    console.error('Error loading keywords:', error);
  }
}

// Display dropdown menus with categories and keywords
function displayDropdowns(data) {
  const container = document.getElementById('dropdown-groups');
  container.innerHTML = '';
  for (const category in data) {
    const keywords = data[category];
    const dropdownDiv = document.createElement('div');
    dropdownDiv.classList.add('dropdown-group');

    const label = document.createElement('label');
    label.textContent = category;
    dropdownDiv.appendChild(label);

    const select = document.createElement('select');
    select.onchange = () => addToPrompt(select.value);

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = `${translations[currentLanguage]['select']} ${category}`;
    select.appendChild(defaultOption);

    keywords.forEach(keyword => {
      const option = document.createElement('option');
      option.value = keyword;
      option.textContent = keyword;
      select.appendChild(option);
    });

    dropdownDiv.appendChild(select);
    container.appendChild(dropdownDiv);
  }
}

// Add selected keyword to prompt
function addToPrompt(keyword) {
  if (keyword) {
    const promptTextarea = document.getElementById('prompt');
    promptTextarea.value += (promptTextarea.value ? ' ' : '') + keyword;
  }
}

// Copy prompt to clipboard
function copyPrompt() {
  const promptTextarea = document.getElementById('prompt');
  navigator.clipboard.writeText(promptTextarea.value)
    .then(() => {
      alert(translations[currentLanguage]['prompt_copied']);
    })
    .catch(err => {
      console.error('Failed to copy text: ', err);
    });
}

// Clear the prompt
function clearPrompt() {
  document.getElementById('prompt').value = '';
}

// Theme Toggle Functionality
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', targetTheme);
  localStorage.setItem('theme', targetTheme);

  // Update the button icon
  const texts = translations[currentLanguage];
  document.getElementById('theme-toggle').textContent = targetTheme === 'dark' ? texts['switch_to_light'] : texts['switch_to_dark'];
}

// Apply saved theme on load
function applyTheme() {
  const savedTheme = localStorage.getItem('theme') || (window.matchMedia("(prefers-color-scheme: dark)").matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Update the button icon
  const texts = translations[currentLanguage];
  document.getElementById('theme-toggle').textContent = savedTheme === 'dark' ? texts['switch_to_light'] : texts['switch_to_dark'];
}

// Initialize the application
window.onload = async function() {
  await loadTranslations();
  applyTheme();
  await loadKeywords();
};
