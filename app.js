//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require('mongoose');
const app = express();
const _ = require('lodash');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
const db = "mongodb+srv://admin-saurabh:7492939466@cluster0.2thlp.mongodb.net/todolistDB?retryWrites=true&w=majority";
mongoose.connect(db).then(() => {
  console.log("connection successfulll");
}).catch((err) => console.log("no connection"));
const itemsschema = new mongoose.Schema({
  name: String
});
const Item = new mongoose.model("Item", itemsschema);
const item1 = new Item({
  name: "Welcome to your to dolist"
});
const item2 = new Item({
  name: "Hit the + button to add a new item"
});
const item3 = new Item({
  name: "<--Hit this  delete an item -->"
});
const defaultitems = [item1, item2, item3];
// Item.insertMany(defaultitems,function(err){
//   if(err){
//     console.log(err);
//   }
//   else{
//     console.log("successfully  saved item default items in db");
//   }
// })
app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultitems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("successfully  saved item default items in db");
        }
      });
      res.redirect("/")
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  })
});
const listschema = mongoose.Schema({
  name: String,
  items: [itemsschema]
})
const List = mongoose.model("List", listschema);

app.get("/:customlistname", function(req, res) {
  const customlistname = _.capitalize(req.params.customlistname);
  List.findOne({
    name: customlistname
  }, function(err, foundlist) {
    if (!err) {
      if (!foundlist) {
        // console.log("doesnot exist ");
        //create a new list
        const list = new List({
          name: customlistname,
          items: defaultitems
        })
        list.save();
        res.redirect("/" + customlistname);
      } else {
        //console.log("exist");
        // show an existing list
        res.render("list", {
          listTitle: foundlist.name,
          newListItems: foundlist.items
        })
      }
    }
  })

  // const list =new List({
  //   name:customlistname,
  //   items:defaultitems
  // })
  // list.save();
})




app.post("/", function(req, res) {
  console.log(req.body.list);
  const itemname = req.body.newItem;
  const listname = req.body.list;
  const item = new Item({
    name: itemname
  })
  if (listname === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listname
    }, function(err, foundlist) {
      foundlist.items.push(item)
      foundlist.save()
      res.redirect("/" + listname);
    })
  }
});





app.post("/delete", function(req, res) {
  //console.log(req.body.checkbox);
  const listname = req.body.listname;
  const checkedItemId = req.body.checkbox;
  if (listname === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) {
        console.log("successfully deleted checked item");
        res.redirect("/");
      }
    })
  } else {
    List.findOneAndUpdate({
      name: listname
    }, {
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    }, function(err, foundlist) {
      if (!err) {
        res.redirect("/" + listname)
      }
    })
  }
})
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server has started successfully ");
});
