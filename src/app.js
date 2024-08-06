const h1 = document.querySelector('h1');
const h4 = document.querySelector('h4');
const catoriesContainer = document.querySelector('#categories-container');

// שליפה של המשתמש הנוכחי מהאחסון
const userJson = sessionStorage.getItem('currentUSer');

if (!userJson) {
  location.href = '/login.html';
}

// המרה של מחרוזת לאובייקט
const user = JSON.parse(userJson);
document.querySelector('h2 span').innerHTML = user.username;

const printCategories = (categories) => {
    // ריקון של האלמנט הפנימי
    catoriesContainer.innerHTML = '';
    // מעבר על הקטגוריות והדפסה של הקטגוריות השונות
    categories.forEach((category) => {
        // יצירה דינמית של הקטגוריה ב דום

        // יצירת האלמנט שיכלול את נתוני הקטגוריה
        // נבחר אלמנט של קישור, מכיוון שבלחיצה על קטגוריה אמורים לעבור לעמוד אחר
        const categoryContainer = document.createElement('a');
        // השמה של העמוד שאליו אמורים לעבור
        categoryContainer.href = `category.html?categoryCode=${category.code}`;

        // יצירת אלמנט תמונה שיכיל את התמונה של הקטגוריה
        const categoryImage = document.createElement('img');
        // קביעת המקור של התמונה. דוגמא לשרשור נכון של משתנים ומחרוזות
        categoryImage.src = `/images/${category.image}`;

        // יציררת אלמנט שיכיל את שם התמונה
        const categoryName = document.createElement('span');
        categoryName.innerHTML = category.name;
        // הוספת מחלקה (עיצוב) לאלמנט
        categoryName.classList.add('category-name');

        // הכנסת האלמנטים הפנימיים לתוך האלמנט שאמור להכיל אותם
        categoryContainer.append(categoryImage);
        categoryContainer.append(categoryName);

        // הכנסת האלמנט של הקטגוריה לתוך המקום הנכון שלו בדום
        catoriesContainer.append(categoryContainer);
    })
}

const fetchStoreData = () => {
   fetch('/data/store.json')
   .then(response => {
      return response.json();
   }).then(data => {
        // כאן יש את הנתונים שהגיעו מהשרת, ומכאן אפשר להשתמש בהם
        h1.innerHTML = data.name;
        h4.innerHTML = data.address;
        printCategories(data.categories);
    })
};

fetchStoreData();