const express= require("express");
const app= express();
const port= 3000;
const bodyParser= require("body-parser");
const mongoose = require("mongoose");
const _ = require('lodash');

app.set("view engine", "ejs");
mongoose.set('strictQuery', true);

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect('mongodb+srv://Raj:Raj18110@cluster0.y9rbp48.mongodb.net/todolistDB');

const itemSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model('Item', itemSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});
const item2 = new Item({
    name: "Hit the + button to add new item"
});
const item3 = new Item({
    name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){
    Item.find({}, function(err, foundItems){
        if (foundItems.length === 0 ) {
            Item.insertMany(defaultItems, function(err){
                if (err) {
                    console.log(err);
                } else {
                    console.log("Success");
                }
            });
            res.redirect("/");
        } else {
            res.render("list", {listTitle: "Today", newListItems: foundItems});
        }
    });  
});

app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name: customListName}, function(err, foundList){
        if (err) {
            console.log(err);
        } else {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/"+ customListName);
            } else {
                res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
            }
        }
    });

});

app.post("/", function(req, res){
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    });
    if (listName === "Today") {
        item.save();
        res.redirect("/"); 
    } else {
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+ listName);
        });
    }
});

app.post("/delete", function(req, res){
    const checkItemId = req.body.checkbox;
    const listName = req.body.listName;
    if (listName=== "Today") {
        Item.findByIdAndRemove(checkItemId, function(err){
            if (err) {
                console.log(err);
            } else {
                console.log("Success");
                res.redirect("/")
            }
        });
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkItemId}}}, function(err, foundList){
            if (err){
                console.log(err);
            } else {
                res.redirect("/"+ listName);
            }
        })
    }
});

app.get("/about", function(req, res){
    res.render("about");
})

// app.post("/work", function(req, res){
//     const item = req.body.newItem;
//     workItems.push(item);
//     res.redirect("/work")
// })

app.listen(port, function(req, res){
    console.log("Server is running on port " + port);
});