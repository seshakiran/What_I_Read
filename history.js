let db;

// Open the IndexedDB database
let request = window.indexedDB.open("ArticleDatabase", 1);

request.onerror = function(event) {
  console.log("Error opening IndexedDB database");
};

request.onsuccess = function(event) {
  db = request.result;
  displayArticles();
};

function displayArticles_old_working() {
  let objectStore = db.transaction("articles").objectStore("articles");

  objectStore.openCursor().onsuccess = function(event) {
    let cursor = event.target.result;

    if (cursor) {
      let article = cursor.value;

      let li = document.createElement('li');
      li.textContent = `${article.title} (${article.date} ${article.time})`;
      document.getElementById('articles').appendChild(li);

      cursor.continue();
    }
  };
}

function exportArticles() {
  let markdown = '';
  let objectStore = db.transaction("articles").objectStore("articles");

  // Get the selected date or the current date and time if no date is selected
  let date = document.getElementById('dateFilter').value || new Date().toISOString();

  objectStore.openCursor().onsuccess = function(event) {
    let cursor = event.target.result;

    if (cursor) {
      let article = cursor.value;

      if (article.export) {
        markdown += `## ${article.title}\n\n[${article.url}](${article.url})\n\n`;
      }

      cursor.continue();
    } else {
      let blob = new Blob([markdown], {type: 'text/markdown'});
      let url = URL.createObjectURL(blob);

      let a = document.createElement('a');
      a.href = url;
      // Replace any characters that are not allowed in filenames with underscores
      let filename = `WhatIRead_export_${date.replace(/[^a-z0-9]/gi, '_')}.md`;
      a.download = filename;
      a.click();
    }
  };
}


let picker = new Pikaday({
  field: document.getElementById('dateFilter'),
  format: 'MM/DD/YYYY',
  onSelect: function() {
    displayArticles(this.getMoment().format('MM/DD/YYYY'));
  }
});

// Add event listener for date filter
document.getElementById('dateFilter').addEventListener('change', function() {
  let date = this.value;
  displayArticles(date);
});

function displayArticles(date) {
  let objectStore = db.transaction("articles").objectStore("articles");
  let table = document.getElementById('articlesTable');
  table.innerHTML = '';  // Clear the table

  // Add table headers
  let headerRow = document.createElement('tr');
  ['Title', 'Date', 'Export'].forEach(headerText => {
    let th = document.createElement('th');
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  objectStore.openCursor().onsuccess = function(event) {
    let cursor = event.target.result;

    if (cursor) {
      let article = cursor.value;

      if (!date || article.date === date) {
        let tr = document.createElement('tr');

        let titleTd = document.createElement('td');
        let a = document.createElement('a');
        a.href = article.url;
        a.textContent = article.title;
        titleTd.appendChild(a);
        tr.appendChild(titleTd);

        let dateTd = document.createElement('td');
        dateTd.textContent = article.date;
        tr.appendChild(dateTd);

        let exportTd = document.createElement('td');
        exportTd.textContent = article.export ? 'Yes' : 'No';
        tr.appendChild(exportTd);

        table.appendChild(tr);
      }

      cursor.continue();
    }
  };
}



document.getElementById('export').addEventListener('click', exportArticles);
