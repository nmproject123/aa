const header = document.querySelector('h2');
const productsContainer = document.querySelector('ul');
const searchBy = document.querySelector('input[name=searchBy]');
const sortBy = document.querySelector('select[name=sortBy]')



// שליפה של המשתמש הנוכחי מהאחסון
const userJson = sessionStorage.getItem('currentUSer');

if (!userJson) {
  location.href = '/login.html';
}

// המרה של מחרוזת לאובייקט
const currentUser = JSON.parse(userJson);

// דבר ראשון חשוב לוודא שאכן הועברה קטגוריה ב url
const searchParams = new URLSearchParams(location.search);
// צורת שליפה של משתנה כלשהוא ממשתני ה url
// משתנה שמגיע מה url 
// מגיע תמיד כמחרוזת ויש להמירו למספר
const categoryCode = parseInt(searchParams.get('categoryCode'));
if (!categoryCode) {
    // ניתוב חזרה לעמוד הבית
    location.href = '/';
}

// משתנה גלובלי שאמור להכיל את כל הנתונים שנצטרך אותם בעמוד, כדי לחסוך קריאת שרת בכל פעם שנצטרך אחד מהם
const dataCategory = {
    category: {},
    products: [],
};

// שליפה של נתונים מהאיחסון
// יש לשלב בשליפה את הקטגוירה הנוכחית
// כאשר שומרים הגדרות חיפוש, חשוב לשמור: מי חיפש, ובאיזו קטגוריה חיפש. לכן התווסף למפתח גם קוד השליפה וגם המשתמש הנוכחי
const criteria = {
    searchBy: localStorage.getItem(`searchBy_${categoryCode}_${currentUser.username}_${currentUser.password}`) || '',
    sortBy: localStorage.getItem(`sortBy_${categoryCode}_${currentUser.username}_${currentUser.password}`) || '',
}

// השמה של הקריטריון בפקדים
searchBy.value = criteria.searchBy;
sortBy.value = criteria.sortBy;

const printProduct = (product) => {
    const li = document.createElement('li');

    li.innerHTML = `<span> name: ${product.name} </span>
                    <span> price: ${product.price} </span>`;

    const buttonAdd = document.createElement('button');
    buttonAdd.innerHTML = '+';
    buttonAdd.onclick = () => {
        // כל מוצר אמור להיות שמור בפורמט הבא:
        // {
        //     code: 111,
        //     amount: 7,
        //     product: {}
        // }
        // שליפה מהאחסון את הסל קניות הנוכחי, המרה שלו למערך רגיל, אם לא שמור עדיין יחזור מערך ריק.
        const currentBag = JSON.parse(localStorage.getItem(`bag_${currentUser.username}_${currentUser.password}`)) || [];
        // בדיקה האם המוצר הנוכחי כבר נשמר בסל
        const currentProduct = currentBag.find(p => p.code === product.code);
        if (currentProduct) {
            currentProduct.amount++;
        } else {
            // הוספת מוצר לסל
            currentBag.push({
                code: product.code,
                amount: 1,
                product,
                // product: product
            });
        }
        
        // שמירה של הסל מחש באחסון, המרה של הסל למחרוזת. במפתח משתמשים בשם המשתמש הנוכחי
        localStorage.setItem(`bag_${currentUser.username}_${currentUser.password}`, JSON.stringify(currentBag));
    }
    li.append(buttonAdd);
    
    li.onclick = () => { console.log('print at ', product);  }
    productsContainer.append(li);
};

const sortProducts = (products, sortBy) => {
    if (!sortBy) {
        return products;
    }
    // sort - פונקציה של מיון על מערכים.
    // ניתן להפעיל אותה ללא פרמטר, ואז היא תנסה לעשות את החיפוש לבד.
    // הפונקציה יודעת למיין מערכים של מחרוזות או מספרים בלבד.
    // בכל מקרה אחר, יש לשלוח לה פונקציה ייעודית למיון
    // הפונקציה מקבלת שני איברים מהמערך, ואמורה להחזיר:
    // 1 - אם האיבר הראשון אמור להיות אחרי האיבר השני (אם הוא גדול יותר)
    // -1 - האיבר הראשון אמור להיות לפני האיבר השני (קטן יותר)
    // 0 - האיברים שווים
    return [...products].sort((product1, product2) => {
        // אם יש מיון לפי מחיר
        if (sortBy === 'price') {
            if (product1.price > product2.price) {
                return 1;
            }
            return -1;
        }
        if (sortBy === 'description') {
            return product1.name.localeCompare(product2.name);
        }
    })
};

const printProducts = () => {
    productsContainer.innerHTML = '';
    // פונקציה של החיפוש
    // מסננת את כל המוצרים שהשם שלהם מכיל את הערך של החיפוש שנמצא בקריטריה
    // בודקת עבור של המוצרים האם שם המוצר מכיל את הערך שנמצא בקריטריון
    const productsToShow = dataCategory.products.filter(pr => pr.name.includes(criteria.searchBy));
    const sortedProducts = sortProducts(productsToShow, criteria.sortBy);
    sortedProducts.forEach((product) => {
        printProduct(product);
    });
    // שמירת נתונים באחסון כדי שבטעינה הבאה נוכול לשלוף אותם ולהראות למשתמש את הנתונים לפי החיפוש
    // בשמירה יש לשלב את הקטגוריה הנוכחית כדי לשלוף את מה שמתאים לקטגוירה
    localStorage.setItem(`searchBy_${categoryCode}_${currentUser.username}_${currentUser.password}`, criteria.searchBy);
    localStorage.setItem(`sortBy_${categoryCode}_${currentUser.username}_${currentUser.password}`, criteria.sortBy);
}

const fetchProducts = () => {
    fetch('/data/products.json')
    .then(response => response.json())
    .then((data) => {
        // פילטור של המוצרים ששייכים לקטגוריה
        const currentProducts = data.filter(pr => pr.category === categoryCode);
        dataCategory.products = currentProducts;
        printProducts();
    })
}

searchBy.onkeyup = searchBy.onchange = (event) => {
    // הערך של הפקדץ כאשר נמחוק את כל הפקד ערך הפקד יהיה מחרוזת ריקה וזה מצוין בשבילינו
    const value = event.target.value;
    // שמירה של ערך החיפוש במשתנה גלובלי
    criteria.searchBy = value;
    printProducts();
};

sortBy.onchange = (event) => {
    const sortByValue = event.target.value;
    criteria.sortBy = sortByValue;
    printProducts();
}


const fetchCategory = () => {
    fetch('/data/store.json?catgegoty=12')
    .then(response => response.json())
    .then((data) => {
        const category = data.categories.find(c => c.code === categoryCode);
        if (!category) {
            location.href = '/';
        }
        dataCategory.category = category;
        header.innerHTML = dataCategory.category.name;
        // הפונקציה נקראת מכאן כי כאן ברור שהקטגוריה כבר נמצאת
        fetchProducts();
    })
}

fetchCategory();
