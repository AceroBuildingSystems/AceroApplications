import { usersMaster } from "./data/UserData"

const EditUserEmpId = ()=>{
    const  newUserData = usersMaster.map((user:any)=>{
        user.empId = user.userid ? user.userid || ""
        delete user.userid;
        return user
    })

    return newUserData
}

