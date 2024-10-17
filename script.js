let translations = {};
let currentLanguage = 'en';
let undoStack = []; // Stack for undo operations
let redoStack = []; // Stack for redo operations

// Load translations
async function loadTranslations() {
  try {
    const response = await fetch('translations.json');
    translations = await response.json();
    populateLanguageMenu();
    applyLanguage();
  } catch (error) {
    console.error('Error loading translations:', error);
  }
}

// Populate language menu
function populateLanguageMenu() {
  const languageMenu = document.getElementById('language-menu');
  languageMenu.innerHTML = '';
  for (const lang in translations) {
    const button = document.createElement('button');
    button.textContent = `${translations[lang]['language_flag']} ${translations[lang]['language_name']}`;
    button.onclick = () => {
      changeLanguage(lang);
      toggleLanguageMenu();
    };
    languageMenu.appendChild(button);
  }
}

// Toggle language menu visibility
function toggleLanguageMenu() {
  const languageMenu = document.getElementById('language-menu');
  languageMenu.style.display = languageMenu.style.display === 'block' ? 'none' : 'block';
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

  // Update action buttons
  document.getElementById('copy-prompt-btn').title = texts['copy_prompt'];
  document.getElementById('clear-prompt-btn').title = texts['clear_prompt'];
  document.getElementById('random-prompt-btn').title = texts['generate_random_prompt'];
  document.getElementById('undo-prompt-btn').title = texts['undo_prompt'];
  document.getElementById('redo-prompt-btn').title = texts['redo_prompt'];

  // Update current language abbreviation
  document.getElementById('current-language').textContent = translations[lang]['language_abbr'];

  // Update theme toggle icon
  const currentTheme = document.documentElement.getAttribute('data-theme');
  document.getElementById('theme-toggle').textContent =
    currentTheme === 'dark' ? texts['switch_to_light'] : texts['switch_to_dark'];

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

// Save the current prompt to the undo stack and clear redo stack
function saveState() {
  const promptTextarea = document.getElementById('prompt');
  undoStack.push(promptTextarea.value);
  // Limit undo stack size to 50
  if (undoStack.length > 50) {
    undoStack.shift();
  }
  redoStack = []; // Clear redo stack
}

// Add selected keyword to prompt and scroll to bottom
function addToPrompt(keyword) {
  if (keyword) {
    saveState();

    const promptTextarea = document.getElementById('prompt');
    promptTextarea.value += (promptTextarea.value ? ' ' : '') + keyword;

    // Scroll to the bottom
    promptTextarea.scrollTop = promptTextarea.scrollHeight;
  }
}

// Copy prompt to clipboard
function copyPrompt() {
  const promptTextarea = document.getElementById('prompt');
  const copyButton = document.getElementById('copy-prompt-btn');

  navigator.clipboard
    .writeText(promptTextarea.value)
    .then(() => {
      // Visual feedback for success
      copyButton.classList.remove('error');
      copyButton.classList.add('success');
      // Remove the class after the animation duration
      setTimeout(() => {
        copyButton.classList.remove('success');
      }, 1000);
    })
    .catch(err => {
      // Visual feedback for error
      copyButton.classList.remove('success');
      copyButton.classList.add('error');
      setTimeout(() => {
        copyButton.classList.remove('error');
      }, 1000);
      console.error('Failed to copy text: ', err);
    });
}

// Clear the prompt
function clearPrompt() {
  const promptTextarea = document.getElementById('prompt');
  const clearButton = document.getElementById('clear-prompt-btn');
  if (promptTextarea.value) {
    saveState();
    promptTextarea.value = '';

    // Visual feedback for success
    clearButton.classList.remove('error');
    clearButton.classList.add('success');
    setTimeout(() => {
      clearButton.classList.remove('success');
    }, 1000);
  } else {
    // Visual feedback for error
    clearButton.classList.remove('success');
    clearButton.classList.add('error');
    setTimeout(() => {
      clearButton.classList.remove('error');
    }, 1000);
  }
}

// Undo last action
function undoPrompt() {
  const promptTextarea = document.getElementById('prompt');
  const undoButton = document.getElementById('undo-prompt-btn');
  if (undoStack.length > 0) {
    redoStack.push(promptTextarea.value);
    promptTextarea.value = undoStack.pop();

    // Visual feedback for success
    undoButton.classList.remove('error');
    undoButton.classList.add('success');
    setTimeout(() => {
      undoButton.classList.remove('success');
    }, 1000);
  } else {
    // Visual feedback for error
    undoButton.classList.remove('success');
    undoButton.classList.add('error');
    setTimeout(() => {
      undoButton.classList.remove('error');
    }, 1000);
  }
}

// Redo last undone action
function redoPrompt() {
  const promptTextarea = document.getElementById('prompt');
  const redoButton = document.getElementById('redo-prompt-btn');
  if (redoStack.length > 0) {
    undoStack.push(promptTextarea.value);
    promptTextarea.value = redoStack.pop();

    // Visual feedback for success
    redoButton.classList.remove('error');
    redoButton.classList.add('success');
    setTimeout(() => {
      redoButton.classList.remove('success');
    }, 1000);
  } else {
    // Visual feedback for error
    redoButton.classList.remove('success');
    redoButton.classList.add('error');
    setTimeout(() => {
      redoButton.classList.remove('error');
    }, 1000);
  }
}

// Theme Toggle Functionality
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', targetTheme);
  localStorage.setItem('theme', targetTheme);

  // Update the button icon
  const texts = translations[currentLanguage];
  document.getElementById('theme-toggle').textContent =
    targetTheme === 'dark' ? texts['switch_to_light'] : texts['switch_to_dark'];
}

// Apply saved theme on load
function applyTheme() {
  const savedTheme =
    localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Update the button icon
  const texts = translations[currentLanguage];
  document.getElementById('theme-toggle').textContent =
    savedTheme === 'dark' ? texts['switch_to_light'] : texts['switch_to_dark'];
}

// Generate Random Prompt and scroll to bottom
function generateRandomPrompt() {
  const randomButton = document.getElementById('random-prompt-btn');
  fetch(`keywords_${currentLanguage}.json`)
    .then(response => response.json())
    .then(data => {
      saveState();

      const promptTextarea = document.getElementById('prompt');
      const categories = Object.keys(data);

      const allKeywords = [];

      // Flatten all keywords into one array
      categories.forEach(category => {
        allKeywords.push(...data[category]);
      });

      // Shuffle the array
      allKeywords.sort(() => 0.5 - Math.random());

      // Decide on a random number of elements to add
      const numberOfElements = Math.min(Math.floor(Math.random() * 5) + 3, allKeywords.length);

      // Select the required number of unique keywords
      const selectedKeywords = allKeywords.slice(0, numberOfElements);

      // Add the selected keywords to the prompt
      promptTextarea.value += (promptTextarea.value ? ' ' : '') + selectedKeywords.join(' ');

      // Scroll to the bottom
      promptTextarea.scrollTop = promptTextarea.scrollHeight;

      // Visual feedback for success
      randomButton.classList.remove('error');
      randomButton.classList.add('success');
      setTimeout(() => {
        randomButton.classList.remove('success');
      }, 1000);

      // Visual feedback on prompt textarea
      promptTextarea.classList.add('highlight');
      setTimeout(() => {
        promptTextarea.classList.remove('highlight');
      }, 500);
    })
    .catch(error => {
      console.error('Error generating random prompt:', error);
      // Visual feedback for error
      randomButton.classList.remove('success');
      randomButton.classList.add('error');
      setTimeout(() => {
        randomButton.classList.remove('error');
      }, 1000);
    });
}

// Close language menu when clicking outside
window.onclick = function (event) {
  if (!event.target.matches('#language-btn') && !event.target.matches('#current-language')) {
    const languageMenu = document.getElementById('language-menu');
    if (languageMenu.style.display === 'block') {
      languageMenu.style.display = 'none';
    }
  }
};

// Initialize the application
window.onload = async function () {
  await loadTranslations();
  applyTheme();
  await loadKeywords();
};
