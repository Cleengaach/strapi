'use strict';
const slugify = require('slugify');
const axios = require('axios');

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */
function TourTime(props) {
    var hours = [];
    var minutes = [];

    console.log(props, 'props');

    props.forEach((point, i) => {
        var cislo = point.time.split(/:|\./g);

        var hour = parseInt(cislo[0], 10);
        var minute = parseInt(cislo[1], 10);

        hours[i] = hour;
        minutes[i] = minute;
    });
    var totalHour = hours.reduce((a, v) => a = a + v, 0);
    var totalMinute = minutes.reduce((a, v) => a = a + v, 0);
    var hourFromMinute = Math.floor((totalMinute / 60));
    totalHour = totalHour + hourFromMinute;
    totalMinute = totalMinute - (hourFromMinute * 60);

    totalMinute = totalMinute.toString();
    if (totalMinute.length < 2) {
        totalMinute = "0" + totalMinute;
    }
    totalHour = totalHour.toString();

    var TimeToRender = false;
    if (props.length) {
        TimeToRender = totalHour + ":" + totalMinute;
    };

    var totalTime = TimeToRender;

    return totalTime;
}

const getUniqueSlug = async (title, subtitle, slugNow, num = 0) => {
    let input = `${title}-${subtitle}`;
    if (num > 0) {
        input = `${title}-${subtitle}-${num}`;
    }
    const slug = slugify(input, {
        lower: true
    });

    const route = await strapi.db.query('api::route.route').findOne({
        select: ['slug'],
        where: { slug: slug },
    });

    if (slug == slugNow) {
        return slug;
    }
    if (!route) {
        return slug;
    }
    else {
        return getUniqueSlug(title, subtitle, slugNow, num + 1);
    }
}

function GetGeoJson(url) {
    // using togeojson in nodejs

    var tj = require('@mapbox/togeojson'),
        fs = require('fs'),
        // node doesn't have xml parsing or a dom. use xmldom
        DOMParser = require('xmldom').DOMParser;

    const { promisify } = require('util');

    const writeFilePromise = promisify(fs.writeFile);

    (async () => {
        const response = await axios.get(url);
        if (response.data) {
            await writeFilePromise('upload.gpx', response.data);
        }

        var gpx = new DOMParser().parseFromString(fs.readFileSync('upload.gpx', 'utf8'));

        var converted = tj.gpx(gpx);
        //var converted = "asdf";
        console.log(converted);
        var convertedWithStyles = tj.gpx(gpx, { styles: true });
        return converted;
    })();


}

module.exports = {
    async beforeCreate(event) {
        console.log(event.params.data.map, 'map')

        if ((event.params.data.map !== null) && (event.params.data.map !== undefined)) {
            var tj = require('@mapbox/togeojson'),
                fs = require('fs'),
                // node doesn't have xml parsing or a dom. use xmldom
                DOMParser = require('xmldom').DOMParser;
            const { promisify } = require('util');
            const writeFilePromise = promisify(fs.writeFile);

            const response = await axios.get(event.params.data.map[0].url);
            if (response.data) {
                await writeFilePromise('upload.gpx', response.data);
            }

            var gpx = new DOMParser().parseFromString(fs.readFileSync('upload.gpx', 'utf8'));

            var converted = tj.gpx(gpx);
            //var convertedWithStyles = tj.gpx(gpx, { styles: true });
            event.params.data.mapJson = converted;
        }
        if (event.params.data.map === null) {
            event.params.data.mapJson = null;
        }
        event.params.data.slug = await getUniqueSlug(event.params.data.title, event.params.data.subtitle, event.params.data.slug);
    },
    async afterCreate() {
        const  fs = require('fs');
        const { promisify } = require('util');
        const writeFilePromise = promisify(fs.writeFile);
        await writeFilePromise('upload.gpx', "");
    },
    async beforeUpdate(event) {
        console.log(event.params.data.map, 'map')
        if ((event.params.data.map !== null) && (event.params.data.map !== undefined)) {
            var tj = require('@mapbox/togeojson'),
                fs = require('fs'),
                // node doesn't have xml parsing or a dom. use xmldom
                DOMParser = require('xmldom').DOMParser;
            const { promisify } = require('util');
            const writeFilePromise = promisify(fs.writeFile);

            const response = await axios.get(event.params.data.map[0].url);
            if (response.data) {
                await writeFilePromise('upload.gpx', response.data);
            }

            var gpx = new DOMParser().parseFromString(fs.readFileSync('upload.gpx', 'utf8'));

            var converted = tj.gpx(gpx);
            //var convertedWithStyles = tj.gpx(gpx, { styles: true });
            event.params.data.mapJson = converted;
        }
        if (event.params.data.map === null) {
            event.params.data.mapJson = null;
        }
        if (event.params.data.title) {
            event.params.data.slug = await getUniqueSlug(event.params.data.title, event.params.data.subtitle, event.params.data.slug);
        }
    },
    async afterUpdate() {
        const  fs = require('fs');
        const { promisify } = require('util');
        const writeFilePromise = promisify(fs.writeFile);
        await writeFilePromise('upload.gpx', "");
    },
};
