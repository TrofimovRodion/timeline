<template>
    <div>
        test
    </div>
</template>
<script>
import { mapState } from 'vuex'
export default {
    computed: {
        ...mapState(['timeline','fromDate','toDate'])
    }
}
</script>
