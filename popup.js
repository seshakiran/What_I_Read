let db;

// Open the IndexedDB database (or create it if it doesn't exist)
let request = window.indexedDB.open("ArticleDatabase", 1);

request.onerror = function(event) {
  console.log("Error opening IndexedDB database");
};

request.onsuccess = function(event) {
  db = request.result;
};

request.onupgradeneeded = function(event) {
  let db = event.target.result;
  let objectStore = db.createObjectStore("articles", { keyPath: "url" });
};

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  let url = tabs[0].url;
  let title = tabs[0].title;
  let date = new Date().toLocaleDateString();
  let time = new Date().toLocaleTimeString();

  document.getElementById('title').textContent = title;
  document.getElementById('url').textContent = url;
  document.getElementById('date').textContent = date;
  document.getElementById('time').textContent = time;

  document.getElementById('mark').addEventListener('click', function() {
    let article = {
      title: title,
      url: url,
      date: date,
      time: time,
      export: true
    };

    let transaction = db.transaction(["articles"], "readwrite");
    let objectStore = transaction.objectStore("articles");
    let request = objectStore.add(article);

    request.onsuccess = function(event) {
      // Display success message
      let message = document.getElementById('message');
      message.textContent = 'Marked for Export!';
      message.style.color = 'green';
      console.log('Article marked for export');
    };

    request.onerror = function(event) {
      console.log('Error adding article to IndexedDB');
    };
  });

  document.getElementById('view').addEventListener('click', function() {
    chrome.tabs.create({url: 'history.html'});
  });
});
