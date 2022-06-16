<style>
.ProseMirror {
  color:#000;
  background:#fcfcfc;
  padding:4px;
  border-bottom:1px solid rgb(118,118,118)
}
.ProseMirror-focused {
  background:#f9f9f9;
  outline: none;
  color:#000;
  caret-color:rgb(25,118,210);
  border-bottom:2px solid rgb(25,118,210)
}
.ProseMirror h1 {
  margin-top:4px;
  margin-bottom:16px;
}
.ProseMirror h2 {
  margin-top:2px;
  margin-bottom:12px;
}
.ProseMirror p {
  margin-bottom:12px;
}
.ProseMirror ul {
  margin-bottom:12px;
}
.ProseMirror li p {
  margin-bottom: 0px;
}
</style>
<template>
  <div>
    <label active class="v-label v-label--active">{{ label }}</label>
    <div v-if="editor">
      <bubble-menu class="bubble-menu" :tippy-options="{ duration: 100 }" :editor="editor">
        <v-btn-toggle multiple :value="['bold', 'italic', 'strike'].filter(key => editor.isActive(key))">
          <v-btn icon x-small value="bold" @click="editor.chain().focus().toggleBold().run()">
            <v-icon>mdi-format-bold</v-icon>
          </v-btn>
          <v-btn icon x-small value="italic" @click="editor.chain().focus().toggleItalic().run()">
            <v-icon>mdi-format-italic</v-icon>
          </v-btn>
          <v-btn icon x-small value="strike" @click="editor.chain().focus().toggleStrike().run()">
            <v-icon>mdi-format-strikethrough</v-icon>
          </v-btn>
        </v-btn-toggle>
      </bubble-menu>

      <floating-menu class="floating-menu" :tippy-options="{ duration: 100 }" :editor="editor">
        <v-btn-toggle>
          <v-btn icon x-small @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
            :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }">
            H1
          </v-btn>
          <v-btn icon x-small @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
            :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }">
            H2
          </v-btn>
          <v-btn icon x-small @click="editor.chain().focus().toggleBulletList().run()"
            :class="{ 'is-active': editor.isActive('bulletList') }">
            <v-icon>mdi-format-list-bulleted</v-icon>
          </v-btn>
        </v-btn-toggle>
      </floating-menu>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/vue-2'
import StarterKit from '@tiptap/starter-kit'
import VInput from 'vuetify/lib/components/VInput/VInput.js';


export default {
  extends: VInput,
  components: {
    EditorContent,
    BubbleMenu,
    FloatingMenu,
  },

  props: {
    label: {
      type: String,
    },
    value: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      editor: null,
    }
  },

  watch: {
    value(value) {
      // HTML
      const isSame = this.editor.getHTML() === value

      // JSON
      // const isSame = JSON.stringify(this.editor.getJSON()) === JSON.stringify(value)

      if (isSame) {
        return
      }

      this.editor.commands.setContent(value, false)
    },
  },

  mounted() {
    this.editor = new Editor({
      content: this.value,
      extensions: [
        StarterKit,
      ],
      onUpdate: () => {
        // HTML
        this.$emit('input', this.editor.getHTML())

        // JSON
        // this.$emit('input', this.editor.getJSON())
      },
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>