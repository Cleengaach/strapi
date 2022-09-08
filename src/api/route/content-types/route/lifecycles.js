'use strict';
const slugify = require('slugify');

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

module.exports = {
    async beforeCreate(event) {

        event.params.data.slug = await getUniqueSlug(event.params.data.title, event.params.data.subtitle, event.params.data.slug);
    },
    async beforeUpdate(event) {

        if (event.params.data.title) {
            event.params.data.slug = await getUniqueSlug(event.params.data.title, event.params.data.subtitle, event.params.data.slug);
        }
    },
};
