document.addEventListener("DOMContentLoaded", function () {
    let semesterCount = 1;

    function addSubject(container) {
        let subjectRows = container.querySelectorAll(".subject-row");
        let subjectNumber = subjectRows.length + 1;

        let subjectRow = document.createElement("div");
        subjectRow.classList.add("row", "mb-3", "subject-row", "align-items-center");
        subjectRow.innerHTML = `
            <div class="col-md-4 mb-2">
                <input type="text" class="form-control subject" placeholder="Subject ${subjectNumber}">
            </div>
            <div class="col-md-3 mb-2">
                <select class="form-control grade">
                    <option value="4.00">A+ (4.00)</option>
                    <option value="3.75">A (3.75)</option>
                    <option value="3.50">A- (3.50)</option>
                    <option value="3.25">B+ (3.25)</option>
                    <option value="3.00">B (3.00)</option>
                    <option value="2.75">B- (2.75)</option>
                    <option value="2.50">C+ (2.50)</option>
                    <option value="2.25">C (2.25)</option>
                    <option value="2.00">D (2.00)</option>
                    <option value="0.00">F (0.00)</option>
                </select>
            </div>
            <div class="col-md-3 mb-2">
                <input type="number" class="form-control credit" placeholder="Credits" min="1">
            </div>
            <div class="col-md-2 text-center">
                <button type="button" class="btn btn-outline-danger remove-subject">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
        `;
        container.appendChild(subjectRow);
    }

    function addSemester() {
        semesterCount++;
        let semesterContainer = document.getElementById("semester-container");

        let newSemester = document.createElement("div");
        newSemester.classList.add("semester", "mt-4");
        newSemester.id = `semester-${semesterCount}`;
        newSemester.innerHTML = `
            <h4>Semester ${semesterCount}</h4>
            <div class="subject-container"></div>
            <button class="btn btn-outline-primary add-subject mt-2">+ Add Subject</button>
            <button class="btn btn-outline-danger remove-semester mt-2">Remove Semester</button>
            <h5 class="text-center mt-3 gpa-label d-none">GPA: <span class="gpa-result">0.00</span></h5>
        `;

        semesterContainer.appendChild(newSemester);
        addSubject(newSemester.querySelector(".subject-container"));
    }

    function calculateCGPA() {
        let semesters = document.querySelectorAll(".semester");
        let totalGPA = 0, semesterCount = 0;

        semesters.forEach(semester => {
            let subjects = semester.querySelectorAll(".subject-row");
            let totalGradePoints = 0, totalCredits = 0;

            subjects.forEach((subject, index) => {
                let gradeValue = parseFloat(subject.querySelector(".grade").value);
                let creditInput = subject.querySelector(".credit");
                let creditValue = parseFloat(creditInput.value);

                if (!isNaN(gradeValue) && !isNaN(creditValue) && creditValue > 0) {
                    totalGradePoints += gradeValue * creditValue;
                    totalCredits += creditValue;
                }
            });

            let gpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : "0.00";
            semester.querySelector(".gpa-result").textContent = gpa;
            semester.querySelector(".gpa-label").classList.remove("d-none");

            if (gpa > 0) {
                totalGPA += parseFloat(gpa);
                semesterCount++;
            }
        });

        let cgpa = semesterCount > 0 ? (totalGPA / semesterCount).toFixed(2) : "0.00";
        document.getElementById("cgpa-result").textContent = cgpa;
        document.getElementById("export-pdf").classList.remove("d-none");
    }

    function exportToPDF() {
        const { jsPDF } = window.jspdf;
        let doc = new jsPDF("p", "mm", "a4");

        doc.setFontSize(20);
        doc.setTextColor(0, 0, 128);
        doc.text("CGPA Report", 105, 20, null, null, "center");

        let y = 40;

        document.querySelectorAll(".semester").forEach((semester, index) => {
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text(`Semester ${index + 1}: GPA - ${semester.querySelector(".gpa-result").textContent}`, 20, y);
            y += 10;

            let subjects = semester.querySelectorAll(".subject-row");

            if (subjects.length > 0) {
                doc.setFontSize(12);
                doc.setTextColor(255, 255, 255);
                doc.setFillColor(0, 0, 0);
                doc.rect(20, y, 170, 8, "F");
                doc.text("Subjects", 30, y + 5);
                doc.text("Grade", 100, y + 5);
                doc.text("Credits", 160, y + 5);
                y += 10;

                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0);

                subjects.forEach((subject, idx) => {
                    let subjectName = subject.querySelector(".subject").value.trim() || `Subject ${idx + 1}`;
                    let gradeValue = subject.querySelector(".grade").selectedOptions[0].text;
                    let creditValue = subject.querySelector(".credit").value || "0";

                    if (idx % 2 === 0) {
                        doc.setFillColor(240, 240, 240);
                        doc.rect(20, y, 170, 7, "F");
                    }
                    
                    doc.text(subjectName, 30, y + 5);
                    doc.text(gradeValue, 100, y + 5);
                    doc.text(creditValue, 160, y + 5);
                    y += 7;
                });

                y += 10;
            }
        });

        y += 10;

        doc.setFontSize(16);
        doc.setTextColor(0, 128, 0);
        doc.text(`Overall CGPA: ${document.getElementById("cgpa-result").textContent}`, 105, y, null, null, "center");
        y += 20;

        let dateTime = new Date().toLocaleString();
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Generated on: ${dateTime}`, 105, y, null, null, "center");
        y += 7;
        doc.text("© 2024 Developed by Saiful", 105, y, null, null, "center");

        doc.save("CGPA_Report.pdf");
    }

    document.getElementById("add-semester").addEventListener("click", addSemester);
    document.getElementById("calculate").addEventListener("click", calculateCGPA);
    document.getElementById("export-pdf").addEventListener("click", exportToPDF);

    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("add-subject")) {
            addSubject(event.target.closest(".semester").querySelector(".subject-container"));
        }
        if (event.target.closest(".remove-subject")) {
            let subjectRow = event.target.closest(".subject-row");
            if (subjectRow) subjectRow.remove();
        }
        if (event.target.classList.contains("remove-semester")) {
            event.target.closest(".semester").remove();
        }
    });

    addSubject(document.querySelector(".subject-container"));
});
