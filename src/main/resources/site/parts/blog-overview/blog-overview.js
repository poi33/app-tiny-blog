var portal = require('/lib/xp/portal'); // Import the portal library
var thymeleaf = require('/lib/xp/thymeleaf'); // Import the Thymeleaf library
var contentLib = require('/lib/xp/content');

function createModel() {
    var site = portal.getSite();

    var content = portal.getContent();

    //query select all blog entries under this content.
    var blog = contentLib.query({
        start: 0,
        count: 150,
        query: "_path LIKE '/content" + content._path + "/*'",
        contentTypes: [
            app.name + ":blog-post",
        ],
    });

    //log.info(JSON.stringify(blog.hits[0], null, 2));
    
    //Go over all images and add the url
    for (var i = 0; i < blog.hits.length; i++) {
        var data = blog.hits[i].data;
        //Images
        if (data.image) {
            var url = portal.imageUrl({
                id: data.image,
                scale: "width(700)",
            });
            blog.hits[i].data.image_url = url;

            //Manage img alt text
            if (!data["alt-text"]) {
                var imgDisplayName = contentLib.get({ key: data.image }).displayName;
                blog.hits[i].data["alt-text"] = imgDisplayName;
            }
        }

        blog.hits[i].data.content = portal.processHtml({ value: data.content });

        if (blog.hits[i].publish.from) {
            blog.hits[i].data.date = formatDate(blog.hits[i].publish.from);
        } else {
            blog.hits[i].data.date = formatDate(blog.hits[i].modifiedTime);
        }
    }

    //log.info(JSON.stringify({}));

    var config = {
        blogposts: blog.hits
    }

    return config;
}

//Takes a iso 8601 date string and optional seperator
function formatDate(dateString, seperator) {
    var dateNumber = Date.parse(dateString);
    var date = new Date(dateNumber);
    if (!seperator) {
        seperator = "/";
    }
    var outString = "";

    outString += date.getMinutes() + ":" + date.getHours() + " ";
    outString += date.getDate() + seperator;
    outString += (date.getMonth() + 1) + seperator;
    outString += date.getFullYear();

    log.info(outString);

    return outString;
}

// Handle the GET request
exports.get = function (req) {

    var css = portal.assetUrl({ path: "style.css" });

    var model = createModel();
    var view = resolve('blog-overview.html');

    //Body rendered page. Append stylesheet to head.
    return {
        body: thymeleaf.render(view, model),
        pageContributions: {
            headBegin: [
                '<link rel="stylesheet" href="' + css + '" />',
            ],
        }
    }
};



