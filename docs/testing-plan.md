# Java Backend Connection & Testing Plan

This plan walks through testing the Java backend integration that has been set up so far. We will verify the User Authentication flow, which is fully functional in the Java backend. 

## Pre-requisites

1. **Start the Database**: Ensure MySQL is running on your machine (Port 3306).
2. **Start the Backend**:
   - Navigate to the `backend` folder in your terminal.
   - Run the Spring Boot application (e.g. `mvn spring-boot:run` or via your IDE).
   - Ensure you see "Tomcat started on port(s): 8080".
3. **Start the Frontend**:
   - Serve the `frontend` folder. (e.g., run `python -m http.server 8000` or use VS Code Live Server inside the `frontend` folder).

---

## 🟢 Test 1: User Registration

**Goal**: Verify that the Java backend can create a new user and save it to the MySQL database.

1. Open your browser and navigate to the frontend's Register page: `http://localhost:8000/register.html` (or whichever port you serve it on).
2. Fill out the form:
   - **Name**: Test User
   - **Email**: test@ecocivic.ai
   - **Password**: password123
   - **Confirm Password**: password123
3. Click **Create Account**.
4. **Expected Result**: 
   - A green success message "Account created successfully!" appears.
   - You can verify the user exists in MySQL by running `SELECT * FROM user;` in your database.

---

## 🟢 Test 2: User Login & JWT Generation

**Goal**: Verify that the Java backend can authenticate the user and issue a JWT token.

1. Click the "Login" link on the Register page, or navigate to `http://localhost:8000/login.html`.
2. Fill out the login form:
   - **Email**: test@ecocivic.ai
   - **Password**: password123
3. Click **Login**.
4. **Expected Result**:
   - A green success message "Login successful!" appears.
   - You are redirected to the `index.html` (Dashboard).
   - *Technical verification*: Open the Browser Developer Tools (F12) -> Application -> Local Storage. Verify that `loggedInUser` is saved and contains a `token` string (your JWT).

---

## 🟡 Test 3: What's Next (The Missing Pieces)

The authentication works, but the complaint submission and dashboard data will still fail (or not show data) because of the remaining gaps we discussed:

1. **Complaints (Reports) require JWTs**: The frontend currently does not attach the `Authorization: Bearer <token>` header to its fetch calls in `script.js` and `dashboard.js`.
2. **Image Uploads**: The Java `POST /api/reports` currently accepts raw JSON, but the frontend sends `multipart/form-data` with an image.
3. **Fetching Data Paths**: The frontend is trying to call `GET /api/complaints` instead of the new `GET /api/reports`.

Please execute **Test 1** and **Test 2**. Once you confirm they work beautifully, we can move on to fixing the file upload and JWT headers for the Reports!
