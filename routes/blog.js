const express = require('express');

const router = express.Router();
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;
const db = require("../data/database");

router.get('/', function(req, res) {
  res.redirect('/posts');
});

router.get('/posts', async function(req, res) {
  const posts = await db.getDb().collection("posts").find().project({title : 1, summary : 1, "author.name" : 1}).toArray();
  res.render('posts-list',{posts : posts});
});

router.get("/posts/:id", async function(req,res,next){
  try {
    const id = req.params.id;
    const post = await db.getDb().collection("posts").findOne({_id : new ObjectId(id)},{projection : {title : 1, body : 1, "author.name" : 1,"author.email" : 1, _id :0, date : 1}});
    post.dateHuman = post.date.toLocaleDateString("en-us",{
      weekday : "long",
      year : "numeric",
      month : "long",
      day: "numeric"
    });
    res.render("post-detail", {post : post});
  } catch (error) {
    return res.status(404).render("404");
    // next(error); 
  }
})

router.post("/posts", async function(req,res){
  const authorId = new ObjectId(req.body.author);
  const postAuthor = await db.getDb().collection("authors").findOne({_id :authorId });
  const newPost = {
    title : req.body.title,
    summary : req.body.summary,
    body : req.body.content,
    date : new Date(),
    author : {
      id :   authorId,
      name :  postAuthor.name,
      email : postAuthor.email
    } 
  };
  await db.getDb().collection("posts").insertOne(newPost);
  res.redirect("/posts");
})

router.get('/new-post', async function(req, res) {
  const authors = await db.getDb().collection("authors").find().toArray();
  res.render('create-post', {authors : authors});
});

router.get("/posts/:id/update",async function(req,res){
  const id = req.params.id;
  const post = await db.getDb().collection("posts").findOne({_id : new ObjectId(id)});
  res.render("update-post", {post : post});
})

router.post("/posts/:id/update", async function(req,res){
  const id = req.params.id;
  await db.getDb().collection("posts").updateOne({_id : new ObjectId(id)},{$set : {title : req.body.title, summary : req.body.summary, body : req.body.content}});
  res.redirect("/posts");

})

router.post("/posts/:id/delete", async function(req,res) {
  const id = req.params.id;
  await db.getDb().collection("posts").deleteOne({_id : new ObjectId(id)});
  res.redirect("/posts");
})

module.exports = router;