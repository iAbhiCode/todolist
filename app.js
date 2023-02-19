const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const _ = require("lodash");
mongoose.set("strictQuery", true);
const port = process.env.PORT || 3000;

const main = async () => {
  const app = express();
  await mongoose.connect("mongodb+srv://pnabhi209801:AbhinavPandey@cluster0.2qesril.mongodb.net/todolistDB");
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.static("public"));
  app.set("view engine", "ejs");

  const itemsSchema = {
    name: String,
  };
  const listSchema = {
    name: String,
    items: [itemsSchema],
  };

  const Item = mongoose.model("Item", itemsSchema);
  const List = mongoose.model("List", listSchema);

  const item1 = new Item({
    name: "Welcome to your ToDoList!!",
  });
  const item2 = new Item({
    name: "Hit the + button to ADD item to your to do list.",
  });
  const item3 = new Item({
    name: "<-- Hit this to delete an item.",
  });

  const defaultItems = [item1, item2, item3];
  app.get("/", function (req, res) {
    Item.find({}, function (err, foundItems) {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems, function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log("Success!!!!!!!!");
          }
        });
        res.redirect("/");
      } else {
        res.render("lists", { listTitles: "Today", newListItems: foundItems });
        console.log(foundItems);
      }
    });
  });
  app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({ name: customListName }, function (err, foundList) {
      if (!err) {
        if (!foundList) {
          const list = new List({
            name: customListName,
            items: defaultItems,
          });
          list.save();
          res.redirect("/" + customListName);
        } else {
          res.render("lists", {
            listTitles: foundList.name,
            newListItems: foundList.items,
          });
        }
      }
    });
  });

  app.post("/", function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
      name: itemName,
    });

    if (listName === "Today") {
      item.save();
      res.redirect("/");
    } else {
      List.findOne({ name: listName }, function (err, foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      });
    }
  });

  app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if (listName === "Today") {
      Item.deleteOne({ _id: checkedItemId }, function (err) {
        if (err) return handleError(err);
        else {
          console.log("Successfully deleted");
          res.redirect("/");
        }
      });
    } else {
      List.findOneAndUpdate(
        { name: listName },
        { $pull: { items: { _id: checkedItemId } } },
        function (err, foundList) {
          if (!err) {
            res.redirect("/" + listName);
          }
        }
      );
    }
  });

  app.listen(port, function () {
    console.log(`Server is running port ${port}`);
  });
};
main();
