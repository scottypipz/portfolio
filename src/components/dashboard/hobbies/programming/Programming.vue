<template>
<div class="Programming-content">
    <div class="Programming__divider Programming__divider__left"/>
    <div class="Programming__divider Programming__divider__right"/>

    <div class="programming-container clearfix"
        id="Programming__container">
        <BestPractices class="programming-practices"/>
        <FavoriteLanguages class="favorite-languages"/>

        <div class="programming-img"></div>
    </div>

    <div class="programming-footer">
        <div class="center-absolute">
            <LinkButton
                data-aos="zoom-in"
                data-aos-anchor-placement="bottom-bottom"
                :text="`Check out my portfolio`"
                :linkName="'Portfolio'"/>
            <div
                class="footer-description"
                data-aos="zoom-in"
                data-aos-anchor-placement="bottom-bottom">
                Check out my different projects and skillsets along with my coding creed.
            </div>
        </div>
    </div>
    <div class="programming-anchor"></div>
</div>
</template>

<script>
export default {
    name: 'Programming-Dashboard',
    components: {
        LinkButton: () => import('../../LinkButton.vue'),
        BestPractices: () => import('./BestPractices.vue'),
        FavoriteLanguages: () => import('./FavoriteLanguages.vue')
    },
}
</script>

<style scoped>
/* Variables */
.Programming-content {
    --triangle-height: 80px;
    --negative-triangle-height: calc(var(--triangle-height) * -1);
}

/* Styles */
.Programming-content {
    color: var(--google-font-white-primary);
    position: relative;
    width: 100%;
}
.Programming {
    position: absolute;
    top: var(--negative-triangle-height);
    left: 0;
    font-weight: 100;

    height: 100%;
    width: 100%;

    z-index: 11;
}
.Programming__divider {
    display: none;
}
.programming-container {
    display: flex;
    position: static;

    background: linear-gradient(180deg, var(--google-grey-primary) 28.65%, var(--google-grey-secondary) 52.29%, var(--google-grey-light) 100%);
    padding: 150px 100px 100px 100px;
}
.programming-footer {
    position: relative;
    height: 400px;
    width: 100%;
    background-image: url('https://s3-ap-southeast-1.amazonaws.com/chefpipz-api-portfolio/images/static/Laptop_blurr_720p.jpg');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;

    box-shadow: inset 0 5px 10px rgba(0, 0, 0, 0.5);
}
.footer-description {
    margin-top: 1.5rem;
}
@media screen and (min-width: 600px) {
    .Programming__divider {
        display: unset;
        position: absolute;
        top: var(--negative-triangle-height);
        width: 0;
        height: 0;
    }
    .Programming__divider.Programming__divider__left {
        left: 0;
        border-bottom: 200px solid var(--google-grey-primary);
        border-right: 150vw solid transparent;
        z-index: 10;
    }
    .Programming__divider.Programming__divider__right {
        right: 0;
        border-bottom: 200px solid var(--google-grey-light);
        border-left: 150vw solid transparent;
        z-index: 9;
    }
    .programming-favorite-languages {
        display: flex;
    }
    .programming-practices,
    .favorite-languages {
        margin: auto;
    }
    .programming-practices {
        flex: 1;
    }
    .favorite-languages {
        flex: 1;
    }
    .practices-label,
    .favorite-languages-label{
        letter-spacing: 10px;
        font-weight: 200;
        margin-bottom: 50px;
    }
    .practices-label{
        font-size: 36px;
        text-align: left;
    }
}
@media screen and (min-width: 1000px) {
    .Programming {
        margin: 0 auto;
    }
}
</style>
