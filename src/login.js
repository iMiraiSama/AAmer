document.getElementById("login-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            // استرجاع بيانات المستخدم من Firestore
            const db = firebase.firestore();
            db.collection("users").doc(user.uid).get().then((doc) => {
                if (doc.exists) {
                    const userType = doc.data().userType; // نوع المستخدم

                    if (userType === "user") {
                        window.location.href = "user-dashboard.html"; // تحويل المستخدم العادي
                    } else if (userType === "provider") {
                        window.location.href = "provider-dashboard.html"; // تحويل مقدم الخدمة
                    } else {
                        alert("نوع الحساب غير معروف. يرجى التواصل مع الدعم الفني.");
                    }
                } else {
                    alert("لم يتم العثور على بيانات المستخدم.");
                }
            }).catch((error) => {
                console.error("خطأ أثناء استرجاع البيانات:", error);
            });

        }).catch((error) => {
            alert("خطأ في تسجيل الدخول: " + error.message);
        });
});