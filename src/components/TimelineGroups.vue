<style>
.groupHeadersWrap {
    width: 200px;
    height: 500px;
    top: 50px;
    position: absolute;
    pointer-events: none;
}

.groupHeaderBackground {
    background: linear-gradient(to right, #fffffff9 30%, #ffffff00);
    position: absolute;
    width: 200px;
    pointer-events: none;
}

.groupHeader.selected .groupHeaderBackground {
    background: linear-gradient(to right, #f9f9f9f9 50%, #f9f9f900);
}

@supports ((-webkit-backdrop-filter: none) or (backdrop-filter: none)) {
    .groupHeaderBackground {
        mask-image: linear-gradient(to right, #fff 30%, #ffffff00);
        background: linear-gradient(to right, #ffffffaa, #ffffff00);
        backdrop-filter: blur(5px);
    }

    .groupHeader.selected .groupHeaderBackground {
        background: linear-gradient(to right, #f9f9f9cc 50%, #f9f9f900);
    }
}

.groupHeader {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: stretch;
}

.groupHeaderTitleWrap {
    position: absolute;
    border-radius: 4px;
    bottom: 1px;
    top: 2px;
    left: 4px;
    padding: 4px 8px;
    font-size: 0.8em;
    font-weight: bold;
}

.groupHeader.selected .groupHeaderTitleWrap {
    border-left-width: 1px !important;
    ;
}

.groupHeaderTitle {
    pointer-events: auto;
    cursor: pointer;
}

.groupHeader.selected .groupHeaderTitle,
.groupHeaderTitle:hover {
    text-decoration: underline;
}

.newGroup {
    height: 250px;
    padding: 8px 8px;
    pointer-events: auto;
}
</style>
<template>
    <div class='timelineGroups'>
        <div class="groupHeadersWrap" :style="{ height: display.height }">
            <div v-for="group in display.groups" :key="group.key" :style="{ height: (group.lines * lineHeight) + 'px' }"
                :class="{ 'groupHeader': true, 'selected': timeline.selectedGroupId == group._id }">
                <div class="groupHeaderBackground" :style="{ height: (group.lines * lineHeight - 1) + 'px' }"></div>
                <div class="groupHeaderTitleWrap"
                    :style="{ color: group.background, borderLeft: '4px solid ' + group.background }">
                    <div class="groupHeaderTitle" @click="selectGroup($event, group)">
                        {{ group.title ? group.title : "Untitled" }}</div>
                </div>
            </div>
            <div class="newGroup">
                <v-btn color="primary" text @click="createGroup({ title: 'New group' })">
                    <v-icon left>mdi-plus</v-icon>
                    New group
                </v-btn>
            </div>
        </div>
    </div>
</template>
<script>
import { DateTime } from 'luxon';
import { mapState } from 'vuex';

export default {
    computed: {
        display: function () {
            let groups = [];
            let top = 0;
            for (let i = 0; i < this.timeline.groups.length; i++) {
                groups.push(Object.assign({}, this.timeline.groups[i]));
                groups[i].top = top;
                let renderedEvents = [];
                for (let j = 0; j < groups[i].events.length; j++) {
                    let event = groups[i].events[j];
                    event.key = event._id;
                    event.startcellnum = Math.ceil(
                        Math.abs(new Date(event.date_start) - new Date(this.fromDate)) /
                        (1000 * 60 * 60 * 24)
                    );
                    renderedEvents.push(Object.assign({}, event));

                }
                groups[i].events = renderedEvents;
                top += groups[i].lines;
            }
            let width = this.cellWidth * (DateTime.fromISO(this.toDate).diff(DateTime.fromISO(this.fromDate), 'days').as('days') + 1);
            return {
                groups: groups,
                height: Math.max(300, top * this.lineHeight) + 'px',
                width: width + 'px'
            };
        },
        ...mapState(["timeline", "fromDate", "toDate", "cellWidth", "lineHeight"]),
    },
    methods: {
        handleClickGroup(groupId) {
            this.editGroupDialog.display = true;
            this.editGroupId = groupId;
        },
        createGroup(params) {
            this.$store.dispatch("timeline/createGroupAction", params);
        },
        selectGroup(e, displayGroup) {
            let group = this.$store.getters["timeline/getGroupById"](displayGroup._id);
            this.$store.dispatch("selectGroupAction", { group: group });
            e.stopPropagation();
        },
    }
}
</script>