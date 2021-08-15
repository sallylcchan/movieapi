# Assignment of movie api

   This API is written by node.js, express.js as server and using mongodb.client connecting to mongodb. Database called movieonline consist of 2 collections - movies and users. The API achieves CRUD operation by POST, GET, UPDATE and DELETE. API is starteded by command "cd api" and "node app.js" in console. The workspace of this api is: [https://replit.com/@zebraMC36/movieapi](https://replit.com/@zebraMC36/movieapi) 

---
## Folder structure

```
+-- index.js
+-- api
|   +-- node_modules
|   +-- app.js
|   +-- package-lock.json
|   +-- package.json
+-- ReadMe.md
```

---
## Database (movieonline) structure

### Collection (movies)
1. _id: ObjectId 
2. title: String
3. year: String
4. imdbid: String
5. type: String
6. poster: String
7. createdt: Date

### Collection (users)
1. _id: ObjectId
2. name: String
3. password: String
4. email: String
5. role: String
6. specialcode: String
7. authkey: String
8. createdt: Date
9. bookmark: Array
10. rate: Array
11. modifieddt: Date

---
## Endpoints

Movie endpoints 

The url structure is:
> ```https://<host name>/<endpoint>```
   
### movie part

| Function | HTTP Method | Endpoint | Url example |
| ------ | ------ | ------ | ------ |
| 1. Search film info by keyword | GET | /searchmovie/:keyword | https://movieapi.zebramc36.repl.co/searchmovie/home |
| 2. Add movie | POST | /addmovie | https://movieapi.zebramc36.repl.co/addmovie | 
| 3. Delete movie | DELETE | /deletefilm | https://movieapi.zebramc36.repl.co/deletemovie |
| 4. Update movie | PUT | /updatefilm | https://movieapi.zebramc36.repl.co/updatefilm |
| 5. List movies info | GET | /movielist | https://movieapi.zebramc36.repl.co/movielist |
| 6. List imdbid of movies | GET | /movieidlist | https://movieapi.zebramc36.repl.co/movieidlist |
   
### user part
   
| Function | HTTP Method | Endpoint | Url example |
| ------ | ------ | ------ | ------ |
| I. Add user | POST | /applyuser | https://movieapi.zebramc36.repl.co/applyuser |
| II. Login | POST | /login | https://movieapi.zebramc36.repl.co/login |
| III. Bookmark movie by user | POST | /bookmarkmovie | https://movieapi.zebramc36.repl.co/bookmarkmovie |
| IV. Rate movie by user | POST | /ratefilm | https://movieapi.zebramc36.repl.co/ratefilm |
| V. List bookmarked movie(s) by user | POST | /userbookmarklist | https://movieapi.zebramc36.repl.co/userbookmarklist |
| VI. List rated movie(s) by user | POST | /userratelist | https://movieapi.zebramc36.repl.co/userratelist |
---   
   
## Video for demo
   
## License

MIT
