fetchTableList();

function paginator(config) {
  // throw errors if insufficient parameters were given
  if (typeof config != "object")
    throw "Paginator was expecting a config object!";
  if (
    typeof config.get_rows != "function" &&
    !(config.table instanceof Element)
  )
    throw "Paginator was expecting a table or get_row function!";

  // get/make an element for storing the page numbers in
  var box;
  if (!(config.box instanceof Element)) {
    config.box = document.createElement("div");
  }
  box = config.box;

  // get/make function for getting table's rows
  if (typeof config.get_rows != "function") {
    config.get_rows = function () {
      var table = config.table;
      var tbody = table.getElementsByTagName("tbody")[0] || table;

      // get all the possible rows for paging
      // exclude any rows that are just headers or empty
      children = tbody.children;
      var trs = [];
      for (var i = 0; i < children.length; i++) {
        if ((children[i].nodeType = "tr")) {
          if (children[i].getElementsByTagName("td").length > 0) {
            trs.push(children[i]);
          }
        }
      }

      return trs;
    };
  }
  var get_rows = config.get_rows;
  var trs = get_rows();

  // get/set rows per page
  if (typeof config.rows_per_page == "undefined") {
    var selects = box.getElementsByTagName("select");
    if (
      typeof selects != "undefined" &&
      selects.length > 0 &&
      typeof selects[0].selectedIndex != "undefined"
    ) {
      config.rows_per_page = selects[0].options[selects[0].selectedIndex].value;
    } else {
      config.rows_per_page = 5;
    }
  }
  var rows_per_page = config.rows_per_page;

  // get/set current page
  if (typeof config.page == "undefined") {
    config.page = 1;
  }
  var page = config.page;

  // get page count
  var pages = rows_per_page > 0 ? Math.ceil(trs.length / rows_per_page) : 1;

  // check that page and page count are sensible values
  if (pages < 1) {
    pages = 1;
  }
  if (page > pages) {
    page = pages;
  }
  if (page < 1) {
    page = 1;
  }
  config.page = page;

  // hide rows not on current page and show the rows that are
  for (var i = 0; i < trs.length; i++) {
    if (typeof trs[i]["data-display"] == "undefined") {
      trs[i]["data-display"] = trs[i].style.display || "";
    }
    if (rows_per_page > 0) {
      if (i < page * rows_per_page && i >= (page - 1) * rows_per_page) {
        trs[i].style.display = trs[i]["data-display"];
      } else {
        trs[i].style.display = "none";
      }
    } else {
      trs[i].style.display = trs[i]["data-display"];
    }
  }

  // page button maker functions
  config.active_class = config.active_class || "active";
  if (
    typeof config.box_mode != "function" &&
    config.box_mode != "list" &&
    config.box_mode != "buttons"
  ) {
    config.box_mode = "button";
  }
  if (typeof config.box_mode == "function") {
    config.box_mode(config);
  } else {
    var make_button;
    if (config.box_mode == "list") {
      make_button = function (symbol, index, config, disabled, active) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = "#";
        a.innerHTML = symbol;
        a.addEventListener(
          "click",
          function (event) {
            event.preventDefault();
            this.parentNode.click();
            return false;
          },
          false
        );
        li.appendChild(a);

        var classes = [];
        if (disabled) {
          classes.push("disabled");
        }
        if (active) {
          classes.push(config.active_class);
        }
        li.className = classes.join(" ");
        li.addEventListener(
          "click",
          function () {
            if (this.className.split(" ").indexOf("disabled") == -1) {
              config.page = index;
              paginator(config);
            }
          },
          false
        );
        return li;
      };
    } else {
      make_button = function (symbol, index, config, disabled, active) {
        var button = document.createElement("button");
        button.innerHTML = symbol;
        button.addEventListener(
          "click",
          function (event) {
            event.preventDefault();
            if (this.disabled != true) {
              config.page = index;
              paginator(config);
            }
            return false;
          },
          false
        );
        if (disabled) {
          button.disabled = true;
        }
        if (active) {
          button.className = config.active_class;
        }
        return button;
      };
    }

    // make page button collection
    var page_box = document.createElement(
      config.box_mode == "list" ? "ul" : "div"
    );
    if (config.box_mode == "list") {
      page_box.className = "pagination";
    }

    var left = make_button(
      "&laquo;",
      page > 1 ? page - 1 : 1,
      config,
      page == 1,
      false
    );
    page_box.appendChild(left);

    for (var i = 1; i <= pages; i++) {
      var li = make_button(i, i, config, false, page == i);
      page_box.appendChild(li);
    }

    var right = make_button(
      "&raquo;",
      pages > page ? page + 1 : page,
      config,
      page == pages,
      false
    );
    page_box.appendChild(right);
    if (box.childNodes.length) {
      while (box.childNodes.length > 1) {
        box.removeChild(box.childNodes[0]);
      }
      box.replaceChild(page_box, box.childNodes[0]);
    } else {
      box.appendChild(page_box);
    }
  }

  var dvRecords = document.createElement("div");
  dvRecords.className = "dvrecords";
  box.appendChild(dvRecords);

  // make rows per page selector
  if (!(typeof config.page_options == "boolean" && !config.page_options)) {
    if (typeof config.page_options == "undefined") {
      config.page_options = [
        { value: 5, text: "5" },
        { value: 10, text: "10" },
        { value: 20, text: "20" },
        { value: 50, text: "50" },
        { value: 100, text: "100" },
        { value: 0, text: "All" },
      ];
    }
    var options = config.page_options;
    var select = document.createElement("select");
    select.className = "records";
    for (var i = 0; i < options.length; i++) {
      var o = document.createElement("option");
      o.value = options[i].value;
      o.text = options[i].text;
      select.appendChild(o);
    }
    select.value = rows_per_page;
    select.addEventListener(
      "change",
      function () {
        config.rows_per_page = this.value;
        paginator(config);
      },
      false
    );
    dvRecords.appendChild(select);
  }

  // status message
  var stat = document.createElement("span");
  stat.className = "stats";
  stat.innerHTML =
    "Showing " +
    ((page - 1) * rows_per_page + 1) +
    "-" +
    (trs.length < page * rows_per_page || rows_per_page == 0
      ? trs.length
      : page * rows_per_page) +
    " of " +
    trs.length;

  dvRecords.appendChild(stat);

  // run tail function
  if (typeof config.tail_call == "function") {
    config.tail_call(config);
  }
  return box;
}
jQuery.fn.sortElements = (function () {
  var sort = [].sort;

  return function (comparator, getSortable) {
    getSortable =
      getSortable ||
      function () {
        return this;
      };

    var placements = this.map(function () {
      var sortElement = getSortable.call(this),
        parentNode = sortElement.parentNode,
        nextSibling = parentNode.insertBefore(
          document.createTextNode(""),
          sortElement.nextSibling
        );

      return function () {
        if (parentNode === this) {
          throw new Error(
            "You can't sort elements if any one is a descendant of another."
          );
        }

        // Insert before flag:
        parentNode.insertBefore(this, nextSibling);
        // Remove flag:
        parentNode.removeChild(nextSibling);
      };
    });

    return sort.call(this, comparator).each(function (i) {
      placements[i].call(getSortable.call(this));
    });
  };
})();

var table = $("table");

$("th")
  .wrapInner('<span title="sort this column"/>')
  .each(function () {
    var th = $(this),
      thIndex = th.index(),
      inverse = false;

    th.click(function () {
      table
        .find("td")
        .filter(function () {
          return $(this).index() === thIndex;
        })
        .sortElements(
          function (a, b) {
            return $.text([a]) > $.text([b])
              ? inverse
                ? -1
                : 1
              : inverse
              ? 1
              : -1;
          },
          function () {
            // parentNode is the element we want to move
            return this.parentNode;
          }
        );

      inverse = !inverse;
    });
  });

// table data//**

function fetchTableList() {
  fetch("data.json")
    .then((res) => res.json())
    .then((data) => {
      data.forEach(function (item) {
        item.data.forEach(function (data) {
          let output = "";
          let tableRef = document
            .getElementById("tableList")
            .getElementsByTagName("tbody")[0];

          function extractDateValues(dateString) {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const monthNum = date.getMonth() + 1;
            const month = new Date(2000, monthNum - 1).toLocaleString(
              "default",
              { month: "short" }
            );
            const day = date.getDate();
            console.log(year);
            console.log(month);
            console.log(day);
            return {
              year,
              month,
              day,
            };
          }
          const dateValues = extractDateValues(data.startDate);
          const dateValues1 = extractDateValues(data.endDate);

          function extractTimeValues(timeString) {
            const date = new Date(timeString);
            let hours = date.getHours();
            let minutes = date.getMinutes();
            let seconds = date.getSeconds();
            let amOrPm = hours >= 12 ? "PM" : "AM";
            hours = hours % 12;
            hours = hours ? hours : 12; // Convert 0 to 12 for AM
            minutes = minutes < 10 ? "0" + minutes : minutes;
            return {
              hours,
              minutes,
              seconds,
              amOrPm,
            };
          }
          const timeValues = extractTimeValues(data.startDate);
          const timeValues1 = extractTimeValues(data.endDate);

          let newRow = tableRef.insertRow(tableRef.rows.length);
          output += `
                  <tr>
                    <td>${data.name}</td>
                    <td> ${dateValues1.month} ${dateValues1.day}, ${dateValues1.year}<br>${timeValues1.hours}:${timeValues1.minutes}:${timeValues1.seconds} ${timeValues1.amOrPm}</td>
                    <td> ${dateValues.month} ${dateValues.day}, ${dateValues.year}<br> ${timeValues.hours}:${timeValues.minutes}:${timeValues.seconds} ${timeValues.amOrPm}</td>
                    <td id="overview"><span>${data.overview}</span></td>
                    <td><div class="table__button-group"><a href="">View<a><i class="fa fa-chevron-right" aria-hidden="true"></i></a> </a></div></td>
                  </tr>
                `;
          newRow.innerHTML = output;
        });

        var allDivs = document.getElementById("overview");
        var table = document.getElementById("tableList");
        for (var i = 0; i < table.rows.length; i++) {
          const cell = table.rows[i].cells[3];
          if (cell.textContent.includes("Declined")) {
            cell.classList.add("declined");
          } else if (cell.textContent.includes("Attended")) {
            cell.classList.add("attended");
          } else if (cell.textContent.includes("Registered")) {
            cell.classList.add("registered");
          } else if (cell.textContent.includes("Waitlist")) {
            cell.classList.add("waitlist");
          } else if (cell.textContent.includes("Cancelled")) {
            cell.classList.add("cancelled");
          }
        }
      });

      // Creates initial view after asynchronous code ends.
      createFirstView();
    })
    .catch((error) => {
      console.log(`Error Fetching data : ${error}`);
      document.getElementById("tableList").innerHTML = "Error Loading Data";
    });
}

function createFirstView() {
  var box = paginator({
    table: document
      .getElementById("data-table")
      .getElementsByTagName("table")[0],
    box_mode: "list",
  });
  box.className = "box";
  document.getElementById("table_box_bootstrap").appendChild(box);
  console.log(box);
}
