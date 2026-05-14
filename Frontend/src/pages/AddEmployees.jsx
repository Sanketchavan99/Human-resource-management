// Use ExcelUpload.jsx here 

import ExcelUpload from "./ExcelUpload";

const AddEmployees = () => {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4 text-center p-2">Add Employees</h1>
            <ExcelUpload />
        </div>
    );
};

export default AddEmployees;

