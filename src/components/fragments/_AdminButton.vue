<template>
<button :class="{ 'font-awesome-fab': fab }"
    :style="style"
    @click="$emit('click')"
>
    <font-awesome-icon :icon="icon"/>
</button>
</template>

<script>
import { library } from '@fortawesome/fontawesome-svg-core'
import { faRedo, faTrashAlt, faEdit, faCheck, faTimes, faBookOpen } from '@fortawesome/free-solid-svg-icons'
library.add( faTrashAlt, faEdit, faCheck, faTimes, faBookOpen, faRedo )

export default {
    name: 'AdminButton',
    props: {
        // The type of font awesome icon
        type: {
            type: String,
            required: true
        },
        // Is Button a FAB or not
        fab: {
            type: Boolean,
            required: false,
            default: false
        },
        // Size of FAB
        size: {
            type: String,
            required: false,
            default: '2rem'
        },
        // Color of icon
        color: {
            type: String,
            required: false,
            default: 'inherit'
        },
        // Color of button
        backgroundColor: {
            type: String,
            required: false,
            default: '#29B6F6'
        }
    },
    data () {
        return {
            icons: {
                delete: 'trash-alt',
                edit: 'edit',
                ok: 'check',
                cancel: 'times',
                bookOpen: 'book-open',
                redo: 'redo'
            }
        }
    },
    computed: {
        icon () {
            return this.icons.hasOwnProperty(this.type)
                ? this.icons[this.type]
                : this.icons.delete
        },

        style () {
            let width = { 'width': this.size }
            let height = { 'height': this.size }
            let backgroundColor = { 'backgroundColor': this.backgroundColor }
            let color = { 'color': this.color }
            return {
                ...width,
                ...height,
                ...backgroundColor,
                ...color
            }
        }
    }
}
</script>

<style scoped>
.font-awesome-fab {
    border-radius: 50%;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
}
@media screen and (min-width: 600px){
    .font-awesome-fab {
        cursor: pointer;
        margin: 0 0.1rem;
    }
}
</style>
