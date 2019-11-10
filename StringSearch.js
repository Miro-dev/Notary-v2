// Load a book from disk
const xhr = new XMLHttpRequest();

function loadBook(fileName, displayName) {
    let currentBook = '';
    let url = 'Books/' + fileName;

    // reset  our UI
    document.getElementById('fileName').innerHTML = displayName;
    document.getElementById('search-stat').innerHTML = '';
    document.getElementById('keyword').value = '';

    // create a server request to load our book
    xhr.open('GET', url, true);
    xhr.send();

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            currentBook = xhr.responseText;
            currentBook.toLowerCase()
            // GIT

            getDocStats(currentBook);

            // Format text
            currentBook = currentBook.replace(/(?:\r\n|\r|\n)/g, '<br>');

            document.getElementById('fileContent').innerHTML = currentBook;

            let elmnt = document.getElementById('fileContent');
            elmnt.scrollTop = 0;
        }
    }
}


// Get the Stats for the Book
async function getDocStats(fileContent) {
    let docLength = document.getElementById("docLength");
    let wordCount = document.getElementById("wordCount");
    let charCount = document.getElementById("charCount");

    let text = fileContent.toLowerCase();
    let wordArray = text.match(/\b\S+\b/g);
    let wordDictionary = {};

    let promise = new Promise((resolve, reject) => {
        resolve(filterStopWords(wordArray))
    });

    let filteredWords = await promise;

    // Filter out the uncommon words


    // Count every word in the wordArray
    for (let word in filteredWords) {
        let wordValue = filteredWords[word];
        if (wordDictionary[wordValue] > 0) {
            wordDictionary[wordValue] += 1;
        } else {
            wordDictionary[wordValue] = 1;
        }
    }

    // Sort the Array

    let wordList = sortProperties(wordDictionary);

    // Return the Top 5 words
    let top5Words = wordList.slice(0, 6);

    // Return the Last 5 words
    let least5Words = wordList.slice(-6, wordList.length);

    // Write the values on the page
    ULTemplate(top5Words, document.getElementById('mostUsed'));
    ULTemplate(least5Words, document.getElementById('leastUsed'));

    docLength.innerText = "Document Length: " + text.length;
    wordCount.innerText = "Word Count: " + wordArray.length;

}

function ULTemplate(items, element) {
    let rowTemplate = document.getElementById('template-ul-items')
    let templateHTML = rowTemplate.innerHTML;
    let resultsHTML = '';

    for (let i = 0; i < items.length - 1; i++) {
        resultsHTML += templateHTML.replace('{{val}}', items[i][0] + " : " + items[i][1] + " time(s)");
    }

    element.innerHTML = resultsHTML;

}

async function getStopWords() {

    let promise = new Promise((resolve, reject) => {

        xhr.open('GET', 'Books/StopWords copy.txt', true);
        xhr.send();

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                let stopWords = xhr.responseText;
                stopWords.toLocaleLowerCase();

                // Format text
                let tempArr = [];
                let resultArr = stopWords.split('\n')
                resultArr.forEach(element => {
                    let t = element.split(" ");
                    t.forEach(element => {
                        if (element !== '') {
                            tempArr.push(element)
                        }
                    });
                });

                tempArr.push('a', 'i', 'mr')
                resolve(tempArr)
            }
        }
    });

    let result = await promise;
    return result;
}


async function filterStopWords(wordsArray) {

    let promise = new Promise((resolve, reject) => {
        resolve(getStopWords())
    });

    let commonWords = await promise;


    let uncommonArr = [];
    let commonObj = {};

    for (let i = 0; i < commonWords.length; i++) {
        commonObj[commonWords[i].trim()] = true
    }

    for (let i = 0; i < wordsArray.length; i++) {
        word = wordsArray[i].trim().toLowerCase();
        if (!commonObj[word]) {
            uncommonArr.push(word);
        }
    }

    return uncommonArr
}

function sortProperties(obj1) {
    // First convert the obj to an Array

    let rtnArray = Object.entries(obj1);

    // Sort the Array
    rtnArray.sort(function (first, second) {
        return second[1] - first[1];
    });
    return rtnArray;
}

// Highlight the words in search
function performMark() {

    // read the key word
    let keyword = document.getElementById('keyword').value;
    let display = document.getElementById('fileContent');


    let newContent = '';

    // find all of the currently marked items
    let spans = document.querySelectorAll('mark');
    // <mark>Harry</mark>

    for (let i = 0; i < spans.length; i++) {
        spans[i].outerHTML = spans[i].innerHTML;
    }

    let re = new RegExp("\\b" + keyword + "\\b", "gi");
    let replaceText = "<mark id='markme'>$&</mark>";
    let bookContent = display.innerHTML;

    // Add the Mark to the book content
    newContent = bookContent.replace(re, replaceText);

    display.innerHTML = newContent;

    let count = document.querySelectorAll('mark').length;

    document.getElementById('search-stat').innerHTML = 'found ' + count + ' matches';

    if (count > 0) {
        let element = document.getElementById("markme")
        element.scrollIntoView();
    };
};