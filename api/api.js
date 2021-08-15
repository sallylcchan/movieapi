const fetch = require("node-fetch")
const express = require("express")
//Managing CORS in Express – Allow Cross Origin Requests
//https://www.positronx.io/express-cors-tutorial/
const cors = require('cors')
const mongoClient = require("mongodb").MongoClient

const mongo_username = 'dbUser'  // update your username
const mongo_password = 'jaT4UW99nXQwBav3' // update your password
const mongo_cluster = 'cluster0.haref.mongodb.net'

const CONNECTION_URI = `mongodb+srv://${mongo_username}:${mongo_password}@${mongo_cluster}/myFirstDatabase?retryWrites=true&w=majority`  //Update the path
const DATABASE_NAME = "movieonline" // Update your database name here
const MOVIESCOLLECTION = "movies" // Update your collection name here
const USERSCOLLECTION = "users"

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

async function findMovieList(){
  return mongoClient.connect(CONNECTION_URI,
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then( (client) => {
      return client.db(DATABASE_NAME)
    })
    .then( (db) => {
      let lsttemp = db.collection(MOVIESCOLLECTION)
      .find({})
      .project({_id: 0, imdbid: 1})
      .toArray()
      //db.close()
      return lsttemp      
    })
    .then( (lst) => {      
      return {issuccess: true, movielist: lst}
    })
    .catch( (err) => {
      return {issuccess: false, errmsg: err}
    })
}

async function findImdbidExist(_id) {
  return mongoClient.connect(CONNECTION_URI,
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then( (client) => {
      return client.db(DATABASE_NAME)
    })
    .then( (db) => {
      let lsttemp = db.collection(MOVIESCOLLECTION).find({imdbid: _id}).toArray()
      //db.close()
      return lsttemp      
    })
    .then( (lst) => {
      if (lst.length > 0 ) {        
        return {issuccess: true, isexist: true}
      } else {
        return {issuccess: true, isexist: false}
      }
    })
    .catch( (err) => {
      return {issuccess: false, errmsg: err}
    })
}

async function findEmailExist(_email){
  return mongoClient.connect(CONNECTION_URI,
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then( (client) => {
      return client.db(DATABASE_NAME)
    })
    .then( (db) => {
      let lsttemp = db.collection(USERSCOLLECTION).find({email: _email}).toArray()
      //db.close()
      return lsttemp      
    })
    .then( (lst) => {
      if (lst.length > 0 ) {        
        return {issuccess: true, isexist: true}
      } else {
        return {issuccess: true, isexist: false}
      }
    })
    .catch( (err) => {
      return {issuccess: false, errmsg: err}
    })
}

function getMoviesFromApiAsync(_search) {
  let res = fetch(    
    'http://www.omdbapi.com/?apikey=8492cf8d&s=' + _search)
    .then((response) => response.json())
    .then((responseJson) => {
      return responseJson.Search;
    })
    .catch((error) => {
      console.error(error);
    });
  return res;
}

async function findUserComment(_authkey){
  return mongoClient.connect(CONNECTION_URI,
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then( (client) => {
      return client.db(DATABASE_NAME)
    })
    .then( (db) => {
      let lsttemp = db.collection(USERSCOLLECTION).find({authkey: _authkey}).toArray()
      //db.close()
      return lsttemp      
    })
    .then( (lst) => {
      if (lst.length > 0 ) {
        //let cdt = lst[0].createdt
        let lstbookmark = lst[0].bookmark
        let lstrate = lst[0].rate
        let result_1 = {issuccess: true, isexist: true, createdt: lst[0].createdt }
        if (lstbookmark === undefined) {
          result_1.bookmark = []
        } else {
          result_1.bookmark = lstbookmark
        }
        if (lstrate === undefined ) {
          result_1.rate = []
        } else {
          result_1.rate = lstrate
        }
        return result_1
      } else {
        return {issuccess: true, isexist: false}
      }
    })
    .catch( (err) => {
      return {issuccess: false, errmsg: err}
    })
}

app.get('/', function(req, res){
  res.send('Testing app.js ...')
})

app.post('/addmovie', async (req, res) => {
  console.log('someone going to insert a new movie')
  let mapForPost = req.body
  if (mapForPost.imdbid === undefined || mapForPost.imdbid === null ) {    
    console.log('No imdbID provided')
    res.status(400).send({"status": 400, "description": 'No imdbID provided'})
    return
  }
  if (mapForPost.role !== 'staff') {
    console.log('Not authorized to add movie!')
    res.status(400).send({"status": 400, "description": 'Not authorized to add movie!'})
    return
  }
  let mapFound = await findImdbidExist(mapForPost.imdbid)
  if (mapFound.issuccess === false ) {
    res.status(400).send({"status": 400, "description": mapFound.errmsg})
    return
  }
  console.log(`mapFound's isexist: ${mapFound.isexist}`)
  if (mapFound.isexist === true ) {
    res.status(400).send({"status": 400, "description": "imdbID already Exist!"})
    return
  }
  mongoClient.connect(CONNECTION_URI, (err, db)=>{
    if(err){
      console.log('error: \n' + err)
      res.status(500).send({"status": 500, "description": err})
    } else {
      const collection = db.db(DATABASE_NAME).collection(MOVIESCOLLECTION)      
      mapForPost.createdt = new Date()      
      collection.insertOne(mapForPost, (err, resp) => {
        if(err) {
          console.log('error: \n' + err)
          res.status(500).send({"status":500, "description":err})
        } else {
          respdata = {
            "status": 201,
            "description": "Data insert successfully",
            "imdbid": mapForPost.imdbid,
            "title": mapForPost.title
          }
          res.status(201).send(respdata)          
        }
        db.close()
      })      
    }
  })
})

app.delete('/deletemovie', async (req, res) => {
  console.log('someone going to delete a new movie')
  let mapForPost = req.body
  if (mapForPost.imdbid === undefined || mapForPost.imdbid === null ) {    
    console.log('No imdbID provided')
    res.status(400).send({"status": 400, "description": 'No imdbID provided'})
    return
  }
  if (mapForPost.role !== 'staff') {
    console.log('Not authorized to delete movie!')
    res.status(400).send({"status": 400, "description": 'Not authorized to delete movie!'})
    return
  }
  let mapFound = await findImdbidExist(mapForPost.imdbid)
  if (mapFound.issuccess === false ) {
    res.status(400).send({"status": 400, "description": mapFound.errmsg})
    return
  }
  console.log(`mapFound's isexist: ${mapFound.isexist}`)
  if (mapFound.isexist === false ) {
    res.status(400).send({"status": 400, "description": "imdbID is not found!"})
    return
  }
  mongoClient.connect(CONNECTION_URI, (err, db)=>{
    if(err){
      console.log('error: \n' + err)
      res.status(500).send({"status": 500, "description": err})
    } else {
      const collection = db.db(DATABASE_NAME).collection(MOVIESCOLLECTION)      
      //mapForPost.createdt = new Date()      
      collection.deleteOne({imdbid: mapForPost.imdbid}, (err, resp) => {
        if(err) {
          console.log('error: \n' + err)
          res.status(500).send({"status":500, "description":err})          
        } else {
          respdata = {
            "status": 201,
            "description": "Data deleted successfully",
            "imdbid": mapForPost.imdbid
          }
          res.status(201).send(respdata)          
        }
        db.close()
      })      
    }
  })
})

app.put('/updatemovie', async (req, res) => {
  //start...
  console.log('someone going to update the movie')
  //check posted body
  let mapForPost = req.body
  if (mapForPost.imdbid === undefined || mapForPost.imdbid === null ) {   
	console.log('No imdbid provided')
    res.status(401).send({"status": 401, "description": 'No imdbid provided'})
    return
  }
  console.log('imdbid: ' + mapForPost.imdbid)
  //check whether imdbid is exist
  let mapMovieFound = await findImdbidExist(mapForPost.imdbid)
  console.log(`mapMovieFound's issuccess: ${mapMovieFound.issuccess}`)
  if (mapMovieFound.issuccess === false ) {
    res.status(400).send({"status": 400, "description": mapMovieFound.errmsg})
    return
  }
  console.log(`mapMovieFound's isexist: ${mapMovieFound.isexist}`)
  if (mapMovieFound.isexist === false ) {
    res.status(400).send({"status": 400, "description": "Movie Not Exist"})
    return
  }  
  //check user's role
  if (mapForPost.role !== 'staff') {
    console.log('Not authorized to update movie!')
    res.status(400).send({"status": 400, "description": 'Not authorized to update movie!'})
    return
  }
  //connect to mongodb
  mongoClient.connect(CONNECTION_URI,
    (err, db) => {
    if(err){
      console.log(err)
      res.status(500).send({"status": 500, "description": err})
    } else {
      const collection = db.db(DATABASE_NAME).collection(MOVIESCOLLECTION)
      //only title, year, type + modifieddt required 
	  //imdbid and poster link would not be edited by staff
      const obj = {
        title : mapForPost.title,
        year : mapForPost.year,
        imdbid : mapForPost.imdbid,
        type : mapForPost.type,
        modifieddt : new Date()
      }
      collection.findOneAndUpdate({'imdbid': mapForPost.imdbid},
        {$set: obj},
        {},
        (err) => {
          if(err) {
            res.status(500).send({"status":500, "description":err})
          } else {
            res.status(201).send({"status":201, "description":`Movie data (${mapForPost.imdbid}) update successfully`})
          }
          db.close()
        })      
    }
  }) 
})

app.get('/movieidlist', (req, res)=> {
		console.log(`Someone request by movie list`);    
		findMovieList()
		.then((lstres) => {
			if (lstres === undefined || lstres === null) 
			{
				res.send({"status":500, "errmsg":"search error!"})
			} else {
        let lstId = []
        //console.log('movielist: ' + lstres.movielist[0])
        lstres.movielist.forEach(          
          (value) => {lstId.push(value.imdbid)}
        )
        if (lstId.length > 0) {
          console.log('first lstId: ' + lstId[0])
        }               
        res.send({"status":200, "list":lstId});
      }
		})
		.catch((error) => { console.error(error)});
	} 
)

app.post('/userratelist', async (req, res) => {
    console.log(`Someone request by user rate list`);    
    let mapForPost = req.body
    if (mapForPost.authkey === undefined || mapForPost.authkey === null ) { 
      console.log('No auth key provided')
      res.status(400).send({"status": 400, "description": 'No auth key provided'})
      return
    } 
    console.log('auth key: ' + mapForPost.authkey)
    let mapUserFound = await findUserComment(mapForPost.authkey) 
    console.log(`mapUserFound's issuccess: ${mapUserFound.issuccess}`)
    if (mapUserFound.issuccess === false ) {
      res.status(400).send({"status": 400, "description": mapUserFound.errmsg})
      return
    }
    console.log(`mapUserFound's isexist: ${mapUserFound.isexist}`)
    if (mapUserFound.isexist === false ) {
      res.status(400).send({"status": 400, "description": "User Not Exist"})
      return
    }
    let lstrate = mapUserFound.rate
    res.send({"status": 200, "list": lstrate})
  }
)

app.post('/userbookmarklist', async (req, res) => {
  console.log(`Someone request by user bookmark list`);    
    let mapForPost = req.body
    if (mapForPost.authkey === undefined || mapForPost.authkey === null ) { 
      console.log('No auth key provided')
      res.status(400).send({"status": 400, "description": 'No auth key provided'})
      return
    } 
    console.log('auth key: ' + mapForPost.authkey)
    let mapUserFound = await findUserComment(mapForPost.authkey) 
    console.log(`mapUserFound's issuccess: ${mapUserFound.issuccess}`)
    if (mapUserFound.issuccess === false ) {
      res.status(400).send({"status": 400, "description": mapUserFound.errmsg})
      return
    }
    console.log(`mapUserFound's isexist: ${mapUserFound.isexist}`)
    if (mapUserFound.isexist === false ) {
      res.status(400).send({"status": 400, "description": "User Not Exist"})
      return
    }
    res.send({"status": 200, "list": mapUserFound.bookmark})
})

app.get('/movielist', (req, res)=> {
  console.log(`Someone request all movie(s)`)
  mongoClient.connect(CONNECTION_URI, 
    (err, db)=>{
    if(err){
      console.log(err)
      res.status(500).send({"status": 500, "description": err})
    } else {
      const collection = db.db(DATABASE_NAME).collection(MOVIESCOLLECTION)
      collection.find({}).toArray((err, result) => {
        if(err) {
          res.status(500).send({"status":500, "description":err})
        } else {
          res.send(result)
        }
        db.close()
      })    
    }
  })
})

app.post('/applyuser', async (req, res)=>{
  console.log('someone going to insert a new user')
  let mapForPost = req.body
  if (mapForPost.email === undefined || mapForPost.email === null ) {    
    console.log('No email provided')
    res.status(400).send({"status": 400, "description": 'No email provided'})
    return
  } 
  if (mapForPost.password === undefined || mapForPost.password === null ) {    
    console.log('No password provided')
    res.status(400).send({"status": 400, "description": 'No password provided'})
    return
  }
  let mapFound = await findEmailExist(mapForPost.email)
  if (mapFound.issuccess === false ) {
    res.status(400).send({"status": 400, "description": mapFound.errmsg})
    return
  }
  //console.log('connnection string: \n' + CONNECTION_URI)
  console.log(`mapFound's isexist: ${mapFound.isexist}`)
  if (mapFound.isexist === true ) {
    res.status(400).send({"status": 400, "description": "Email already Exist!"})
    return
  }
  console.log('special code: ' + mapForPost.specialcode)
  let role = (mapForPost.specialcode == 'abcdef' ? 'staff' : 'customer')
  mongoClient.connect(CONNECTION_URI,
  (err, db)=>{
    if(err){
      console.log('error: \n' + err)
      res.status(500).send({"status": 500, "description": err})
    } else {
      const collection = db.db(DATABASE_NAME).collection(USERSCOLLECTION)
      //create and add accesskey
      mapForPost.authkey = (new Date()).getTime().toString(36) + Math.random().toString(36).slice(2)
      mapForPost.createdt = new Date()
      mapForPost.role = role    
      collection.insertOne(mapForPost, (err, resp) => {
        if(err) {
          console.log('error: \n' + err)
          res.status(500).send({"status":500, "description":err})          
        } else {
          respdata = {
            "status": 201,
            "description": "Data insert successfully",
            "name": mapForPost.name,
            "authkey": mapForPost.authkey,
            "role": mapForPost.role 
          }
          res.status(201).send(respdata)          
        }
        db.close()
      })      
    }
  })
})

app.post('/login', (req, res)=>{
  console.log('someone trying to login')
  let mapForPost = req.body
  if (mapForPost.email === undefined || mapForPost.email === null ) {    
    console.log('No email provided')
    res.status(400).send({"status": 400, "description": 'No email provided'})
    return
  } 
  if (mapForPost.password === undefined || mapForPost.password === null ) {    
    console.log('No password provided')
    res.status(400).send({"status": 400, "description": 'No password provided'})
    return
  }
  mongoClient.connect(CONNECTION_URI,
    (err, db)=>{
    if(err){
      console.log(err)
      res.status(500).send({"status": 500, "description": err})
    } else {
      const collection = db.db(DATABASE_NAME).collection(USERSCOLLECTION)
      collection.find(
        {email: mapForPost.email, password: mapForPost.password,
         authkey:{$exists:true}, authkey: {$ne:null}})
        .project({_id: 0, authkey: 1, name: 1, role: 1})
        .toArray((err, result) => {
          if(err) {
            res.status(500).send({"status":500, "description":err})
          } else {
            res.send(result[0])
          }
          db.close()
        })      
    }
  }) 
})

app.get('/searchmovie/:keyword', (req, res)=> {
		console.log(`Someone request by search keyword`);
    const keyword = req.params.keyword;
    console.log('keyword: ' + keyword);
		getMoviesFromApiAsync(keyword)
		.then((lstres) => {
			if (lstres === undefined || lstres === null) 
			{
				res.send({"status":500, "description":"search error!"})
			} else {
        if (lstres.length === 0)
			  {
				  res.send({"status":204, "description":"search nothing!"})
			  } else {
          res.send({"status":200, "description":lstres});
        }
      }
		})
		.catch((error) => { console.error(error)});
	}
)

app.put('/bookmarkmovie', async (req, res)=>{
  console.log('someone going to bookmark the movie')
  let mapForPost = req.body
  if (mapForPost.authkey === undefined || mapForPost.authkey === null ) { console.log('No auth key provided')
    res.status(400).send({"status": 400, "description": 'No auth key provided'})
    return
  } 
  console.log('auth key: ' + mapForPost.authkey)
  let mapUserFound = await findUserComment(mapForPost.authkey) 
  console.log(`mapUserFound's issuccess: ${mapUserFound.issuccess}`)
  if (mapUserFound.issuccess === false ) {
    res.status(400).send({"status": 400, "description": mapUserFound.errmsg})
    return
  }
  console.log(`mapUserFound's isexist: ${mapUserFound.isexist}`)
  if (mapUserFound.isexist === false ) {
    res.status(400).send({"status": 400, "description": "User Not Exist"})
    return
  }
  console.log(`mapUserFound's bookmark: ${mapUserFound.bookmark}`)
  //const imdbid = req.params.imdbid
  //check whether imdbid is exist
  let mapMovieFound = await findImdbidExist(mapForPost.imdbid)
  console.log(`mapMovieFound's issuccess: ${mapMovieFound.issuccess}`)
  if (mapMovieFound.issuccess === false ) {
    res.status(400).send({"status": 400, "description": mapMovieFound.errmsg})
    return
  }
  console.log(`mapMovieFound's isexist: ${mapMovieFound.isexist}`)
  if (mapMovieFound.isexist === false ) {
    res.status(400).send({"status": 400, "description": "Movie Not Exist"})
    return
  }  
  let lstbookmark = mapUserFound.bookmark
  let foundidx = lstbookmark.indexOf(mapForPost.imdbid)
  if (foundidx === -1){
    lstbookmark.push(mapForPost.imdbid) //bookmark (i.e. INSERT)
  } else {
    lstbookmark.splice(foundidx, 1) //unbookmark (i.e. DELETE)
  }
  mongoClient.connect(CONNECTION_URI,
    (err, db) => {
    if(err){
      console.log(err)
      res.status(500).send({"status": 500, "description": err})
    } else {
      const collection = db.db(DATABASE_NAME).collection(USERSCOLLECTION)      
      const obj = {
        modifieddt : new Date(),
        bookmark: lstbookmark
      }      
      collection.findOneAndUpdate({'authkey': mapForPost.authkey},
        {$set: obj},
        {},
        (err) => {
          if(err) {
            res.status(500).send({"status":500, "description":err})
          } else {
            res.status(201).send({"status":201, "description":"Bookmark data update successfully"})
          }
          db.close()
        })      
    }
  }) 
})

app.put('/ratemovie', async (req, res)=>{
  console.log('someone going to rate the movie')
  let mapForPost = req.body
  if (mapForPost.authkey === undefined || mapForPost.authkey === null ) { console.log('No auth key provided')
    res.status(400).send({"status": 400, "description": 'No auth key provided'})
    return
  } 
  console.log('auth key: ' + mapForPost.authkey)
  let mapUserFound = await findUserComment(mapForPost.authkey) 
  console.log(`mapUserFound's issuccess: ${mapUserFound.issuccess}`)
  if (mapUserFound.issuccess === false ) {
    res.status(400).send({"status": 400, "description": mapUserFound.errmsg})
    return
  }
  console.log(`mapUserFound's isexist: ${mapUserFound.isexist}`)
  if (mapUserFound.isexist === false ) {
    res.status(400).send({"status": 400, "description": "Not Exist"})
    return
  }
  //console.log(`mapUserFound's bookmark: ${mapUserFound.bookmark}`) 
  //check whether imdbid is exist
  let mapMovieFound = await findImdbidExist(mapForPost.imdbid)
  console.log(`mapMovieFound's issuccess: ${mapMovieFound.issuccess}`)
  if (mapMovieFound.issuccess === false ) {
    res.status(400).send({"status": 400, "description": mapMovieFound.errmsg})
    return
  }
  console.log(`mapMovieFound's isexist: ${mapMovieFound.isexist}`)
  if (mapMovieFound.isexist === false ) {
    res.status(400).send({"status": 400, "description": "Movie Not Exist"})
    return
  }  
  let lstrate = mapUserFound.rate

  let foundidx = lstrate.map( function(elem) { return elem.movieid }).indexOf(mapForPost.imdbid)
  if (foundidx === -1) {
    // imdbid rate is not found, then push a new one (i.e. INSERT)
    lstrate.push( {movieid: mapForPost.imdbid, movierate: mapForPost.rate} )
  } else {
    // imdbid rate is found, then replace by new one
    // case 1: replace by new one if provided rate > 0 (i.e. UPDATE)
    // case 2: delete from list (i.e. DELETE)
    if (mapForPost.rate > 0) {
      lstrate.splice(foundidx, 1, {movieid: mapForPost.imdbid, movierate: mapForPost.rate})
    } else {
      lstrate.splice(foundidx, 1)
    }    
  }
  mongoClient.connect(CONNECTION_URI,
    (err, db) => {
    if(err){
      console.log(err)
      res.status(500).send({"status": 500, "description": err})
    } else {
      const collection = db.db(DATABASE_NAME).collection(USERSCOLLECTION)      
      const obj = {
        modifieddt : new Date(),
        rate: lstrate
      }      
      collection.findOneAndUpdate({'authkey': mapForPost.authkey},
        {$set: obj},
        {},
        (err) => {
          if(err) {
            res.status(500).send({"status":500, "description":err})
          } else {
            res.status(201).send({"status":201, "description":"Rate data update successfully"})
          }
          db.close()
        })      
    }
  }) 
})

app.listen(10889, () => {
  console.log('Server is ready.')
})
