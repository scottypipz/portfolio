<template>
	<div class="SocialMediaAccounts">
		<a v-for="(icon, i) in icons"
			:key="i"
			:href="links[i]"
			target="_blank"
		>
			<font-awesome-icon :icon="icon"/>
		</a>

	</div>
</template>
<script type="text/javascript">
import { FabIcon } from '@/classes/classes.js'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faFacebook, faGithub, faLinkedin, faInstagram, faSteam } from '@fortawesome/free-brands-svg-icons'
library.add( faFacebook, faGithub, faLinkedin, faInstagram, faSteam )
export default {
	name: 'SocialMediaAccounts',
	data () {
		return {
			icons: [
				new FabIcon('github'),
				new FabIcon('linkedin'),
				new FabIcon('facebook'),
				new FabIcon('instagram'),
				new FabIcon('steam')
			],
			links: [
				'https://github.com/scottypipz',
				'https://www.linkedin.com/in/paolo-vincent-julian-104619118',
				'https://web.facebook.com/profile.php?id=100009112171359',
				'https://www.instagram.com/chefpipz.php/?hl=en',
				'https://steamcommunity.com/id/frenchKisss/'

			]
		}
	}
}
</script>
<style>
.SocialMediaAccounts {
	display: flex;
	justify-content: center;
	align-items: flex-start;
	height: 100px;

	flex-wrap: wrap;
	text-align: center;
	vertical-align: middle;
	font-size: 1.5rem;
	color: var(--google-font-white-primary);

	z-index: 1;

}
.SocialMediaAccounts svg{
	margin: auto;
	margin-left: 0.5rem;
	flex: 1;
}
/* TAB */
@media screen and (min-width: 600px) {
	.SocialMediaAccounts a {
		cursor: pointer;
		transition: transform 200ms ease-in-out;
	}
}
/* WEB */
@media screen and (min-width: 1000px) {
	.SocialMediaAccounts {
		top: calc(var(--my-navbar-height) + 0.5rem);
	}
}
/* TRANSITIONS */
.SocialMediaAccounts a:hover {
	transform: scale(1.2);
}
</style>