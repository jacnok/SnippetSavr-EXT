document.getElementById('toggleTheme').addEventListener('click', toggleTheme);
document.getElementById('save').addEventListener('click', saveSnippet);
document.getElementById('copy').addEventListener('click', copySnippet);

function toggleTheme() {
  const body = document.body;
  const isDarkMode = body.classList.contains('dark-mode');
  const newTheme = isDarkMode ? 'light-mode' : 'dark-mode';
  body.classList.toggle('dark-mode', !isDarkMode);
  body.classList.toggle('light-mode', isDarkMode);
  updateElementsClass(newTheme, isDarkMode ? 'dark-mode' : 'light-mode');
  chrome.storage.local.set({ theme: newTheme });
}

function updateElementsClass(addClass, removeClass) {
  const elements = document.querySelectorAll('textarea, button, #savedSnippets, #savedSnippets div');
  elements.forEach(element => {
    element.classList.remove(removeClass);
    element.classList.add(addClass);
  });
}

function saveSnippet() {
  const snippet = document.getElementById('snippet').value;
  if (snippet) {
    chrome.storage.local.get({ snippets: [] }, function(result) {
      const snippets = result.snippets;
      snippets.push(snippet);
      chrome.storage.local.set({ snippets: snippets }, function() {
        displaySnippets();
        document.getElementById('snippet').value = ''; // Clear the textarea
      });
    });
  }
}

function deleteSnippet(index) {
  chrome.storage.local.get({ snippets: [] }, function(result) {
    const snippets = result.snippets;
    snippets.splice(index, 1);
    chrome.storage.local.set({ snippets: snippets }, function() {
      displaySnippets();
    });
  });
}

function editSnippet(index) {
  chrome.storage.local.get({ snippets: [] }, function(result) {
    const snippets = result.snippets;
    document.getElementById('snippet').value = snippets[index];
    deleteSnippet(index); // Remove the snippet from the list to avoid duplicates
  });
}

function quickCopySnippet(snippet) {
  navigator.clipboard.writeText(snippet).then(() => {
    alert('Snippet copied to clipboard!');
  });
}

function copySnippet() {
  const snippet = document.getElementById('snippet').value;
  navigator.clipboard.writeText(snippet).then(() => {
    alert('Snippet copied to clipboard!');
  });
}

function displaySnippets() {
  chrome.storage.local.get({ snippets: [] }, function(result) {
    const snippets = result.snippets;
    const savedSnippetsDiv = document.getElementById('savedSnippets');
    savedSnippetsDiv.innerHTML = '';
    snippets.forEach((snippet, index) => {
      const snippetDiv = document.createElement('div');
      snippetDiv.textContent = snippet;

      const iconBtnContainer = document.createElement('div');
      iconBtnContainer.classList.add('icon-button-container');

      const editButton = document.createElement('button');
      editButton.innerHTML = '<img src="img/edit.svg" alt="Edit" class="snipIcons">';
      editButton.addEventListener('click', () => editSnippet(index));

      const deleteButton = document.createElement('button');
      deleteButton.innerHTML = '<img src="img/delete.svg" alt="Delete" class="snipIcons">';
      deleteButton.addEventListener('click', () => deleteSnippet(index));

      const copyButton = document.createElement('button');
      copyButton.innerHTML = '<img src="img/copy.svg" alt="Copy" class="snipIcons">';
      copyButton.addEventListener('click', () => quickCopySnippet(snippet));

      iconBtnContainer.appendChild(editButton);
      iconBtnContainer.appendChild(deleteButton);
      iconBtnContainer.appendChild(copyButton);

      snippetDiv.appendChild(iconBtnContainer);

      savedSnippetsDiv.appendChild(snippetDiv);
    });
  });
}

// Initialize the theme based on saved preference
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['theme'], function(result) {
    const theme = result.theme || 'light-mode';
    document.body.classList.add(theme);
    updateElementsClass(theme, theme === 'light-mode' ? 'dark-mode' : 'light-mode');
  });
  displaySnippets();
});
