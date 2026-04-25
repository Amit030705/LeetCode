const validator =require("validator");

// req.body 

const validate = (data)=>{
   
    const mandatoryField = ['firstName',"emailId",'password'];

    const IsAllowed = mandatoryField.every((k)=> Object.keys(data).includes(k));

    if(!IsAllowed)
        throw new Error("Some Field Missing");

    if(!validator.isEmail(data.emailId))
        throw new Error("Invalid Email");

    if(data.firstName.length < 3 || data.firstName.length > 20)
        throw new Error("First name must be between 3 and 20 characters");

    if(data.lastName && (data.lastName.length < 3 || data.lastName.length > 20))
        throw new Error("Last name must be between 3 and 20 characters");

    if(data.password.length < 8)
        throw new Error("Password must be at least 8 characters");
}

module.exports = validate;
