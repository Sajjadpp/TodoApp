var db=require('../config/connection')
var collection=require('../config/collection');
var bycrpt = require('bcrypt');
const { response, set } = require('../app');
var moment = require('moment');
var crypto = require('crypto');

module.exports={


    signup:(userData)=>{
        userData.Age
        userData.secondName
        userData.Education
        userData.phoneNo

        let response={}
        return new Promise(async(resolve, reject) => {

            let userExist =await db.get().collection(collection.USERS).findOne({email:userData.email})
            if(userExist) {
                console.log(userExist);
                response.status=false;
                resolve(response)
            }
            else{

                if( userData.password === userData.confirmPassword) {

                    userData.password = await bycrpt.hash(userData.password,10);
                    userData.confirmPassword = await bycrpt.hash(userData.confirmPassword,10);

                    db.get().collection(collection.USERS).insertOne(userData).then((data)=>{
                        response.status=true;
                        resolve(response)
                        console.log('worked')
                    })
                }
                else{
                  response.status = false;
                  console.log("password is incorrect");
                  resolve(response);
                }
            }
        })
    },
    
    DoLogin:(userData)=>{
        
        let response={}
        return new Promise(async(resolve, reject) => {
            let userExist=await db.get().collection(collection.USERS).findOne({email:userData.email});

            if (userExist) {
                console.log('user Exist')
                bycrpt.compare(userData.password,userExist.password).then((status)=>{
                    if (status) {
                        response.status = true
                        response.user = userExist
                        
                        resolve(response)
                    }
                    else {
                        response.status = false
                        console.log('password is incorrect');
                        resolve(response)
                    }
                })
            }
            else{
                response.status = false
                console.log('userNot Exist');
                resolve(response)
            }
            
        })
    },
    
    CreateNewTask:(data)=>{

        if(data.date===''){
            if(data.day==='Today'){

                data.date = new Date()
            }
            if(data.date === 'Tomarrow'){
                data.date = new Date()+1;
            }
            

        }
        else{
            data.date = data.date
        }       
        return new Promise(async(resolve,reject)=>{
            let taskOBJ = {
                user:data.user,
                content:[{
                    day: data.day,
                    task: data.task,
                    id:crypto.randomBytes(10).toString('hex'),
                    date:data.date,
                    proccess:'pending'
                }]
            }
            let userExist = await db.get().collection(collection.TASK).findOne({user:data.user});
            if(userExist){
                db.get().collection(collection.TASK).updateOne({user:data.user},
                    {
                        $push:{
                            content:{
                                day: data.day,
                                task: data.task,
                                discription: data.discription,
                                id:crypto.randomBytes(10).toString('hex'),
                                date:data.date,
                                proccess:'pending'
                            }
                        }
                    }).then((response)=>{
                        console.log(data.date)
                        resolve()
                    })
            }
            else{
                db.get().collection(collection.TASK).insertOne(taskOBJ).then((resolve)=>{
                    console.log('worked');
                }).then((response)=>{
                    resolve()
                })
            }
            
        })
    },



    takeTask:(user)=>{
        return new Promise(async(resolve,reject)=>{
            let task = await db.get().collection(collection.TASK).findOne({user:user})

            resolve(task);
        })
    },

    EditProfile:(data,userId)=>{
        
        let dataOBJ = {
            additionaldata:data
        }
        console.log(userId)
        return new Promise(async(resolve, reject) => {
           
            db.get().collection(collection.USERS).updateOne({email:userId},
                {
                    $set:{
                        Age:data.Age,
                        Education:data.Education,
                        PhoneNo:data.PhoneNo,
                        secondName:data.secondName
                    }
                }).then((response)=>{
                resolve(response)
            })
                
        })
    },

    profile:(user)=>{
        return new Promise(async(resolve, reject) => {
             
            let profile = await db.get().collection(collection.USERS).findOne({email:user.email})

            resolve(profile)
        })
    },

    deleteTask:(taskId,user)=>{
        return new Promise((resolve, reject) => {
            console.log(user)
            db.get().collection(collection.TASK).updateOne({user:user},
                {
                    $pull:{content:{id:taskId}}
                })
        }).then((response)=>{
            resolve()
        })
    },

    takeCurrentTask:(user)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.TASK).findOne({user:user}).then((response)=>{

                console.log('hisajbsbbdbd',response)
            })
            
            
            
        })
    }
    
}