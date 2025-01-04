import axios, { AxiosError, Method } from "axios";
import { LoginRequest, LoginResponse, MapUserItems, RegisterRequest, RegisterResponse } from "../typings/APIRequests";
import { Dialog } from "leet-mvc/pages/DialogPage/DialogPage";
import { Alert } from "leet-mvc/core/simple_confirm";
import { State } from "leet-mvc/core/State";
import { Storage } from "leet-mvc/core/storage";
import { Injector } from "leet-mvc/core/Injector";
import { InjectTemplate } from "./InjectTemplate";
import { UserReportPage } from "./Pages/UserReportPage/UserReportPage";

var Inject  = Injector.implement(InjectTemplate);

export class UserSignIn {
    url: string;
    _token: string;

    userSigninStatusChanged = State(<LoginResponse>null)

    constructor(url: string){
        this.url = url;

        this._token = Storage.get("TOKEN");
    }

    checkLoginStatus(){
        if (!this._token) {
            this.setToken(null);
            return;
        }
        this.request("GET", "/api/check_token").then((data)=>{
            this.setToken(data)
        }).catch((err)=>{
            console.error(err)
        })
    }

    async showLoginDialog() {
        let d = Dialog("Sign In");
        d.addLabel(null, "Sign in to the UCCNC Editor App to be able to load screensets from your computer!");

        d.addText("username", "Username/Email", "", "string|required|min:5|max:50");
        d.addPassword("password", "Password", "", "string|required|min:5|max:50");

        d.addLink("register_link",null,"Not a member yet? Register now!");

        d.content.onClick = (evt)=>{
            if (evt.target.getAttribute("name")=="register_link") {
                this.showRegisterDialog();
            }
        }
        d.addActionButton("Cancel", null)
        d.addActionButton("Sign In", ()=>{
            if (!d.validate()) return false;
            this.login(<LoginRequest>d.content.getVisibleData()).then(data=>{
                this.setToken(data);
                d.destroy();
            }).catch(err=>{
                Alert(err.message, null, "Unable to sign in!");
            })

            return false;
            
        })
    }

    login(data: LoginRequest) {
        return this.request("POST", "/api/login", data).then(data=>{
            return <LoginResponse> data;
        })
    }

    async showRegisterDialog() {
        let d = Dialog("Create Account");
        d.addLabel(null, "Register with the UCCNC Editor App to be able to load screensets from your computer!");

        d.addText("username", "Email", "", "email|required|min:5|max:50");
        d.addPassword("password", "Password", "", "string|required|min:5|max:50");

        d.addText("first_name", "First Name", "", "string|required|min:2|max:50");
        d.addText("last_name", "Last Name", "", "string|required|min:2|max:50");
        //d.addLink("register_link",null,"Not a member yet? Register now!");

        d.addActionButton("Cancel", null)
        d.addActionButton("Register", ()=>{
            if (!d.validate()) return false;
            this.register(<RegisterRequest>d.content.getVisibleData()).then(data=>{
                Alert(data.message, ()=>{
                    d.destroy();
                }, "Rgistration successful!");
                
            }).catch(err=>{
                Alert(err.message, null, "Unable to register!");
            })

            return false;
            
        })
    }

    register(data: RegisterRequest) {
        return this.request("POST", "/api/register", data).then(data=>{
            return <RegisterResponse> data;
        })
    }


    setToken(data: LoginResponse|null) {
        this._token = data?.token;
        Storage.set("TOKEN",  data?.token || null);
        if ( data?.token) {
            this.userSigninStatusChanged.set(data)
        } else {
            this.userSigninStatusChanged.set(null);
        }
    }

    async request (method: Method, endpoint: string, data?:any): Promise<any> {
        if (!this.url) {
          throw new Error("Tool DB API Url is not set up!");
        }
    
        let headers:any = {
          "content-type": "application/json"
        }
    
        
        if (this._token) {
          headers["Authorization"] = "Bearer " + this._token;
        }
    
        return await axios.request({
          url: this.url + endpoint,
          method: method,
          data: data,
          headers: headers
        }).then(res=>{
          return res.data;
        }).catch((err: AxiosError)=>{
          if (err.response?.status==401) {
            this.setToken(null);
          }
          throw err;
        })
    }

    async showEditUsers() {
        //throw new Error("Method not implemented.");
       
        let p = Inject.Nav.push(UserReportPage)

        p.items = await this.getUsers();


    }

    async getUsers(){
        return this.request('GET', '/admin/users').then(MapUserItems)
    }
    
}