
---

# Prose Editor

+ Drop-In WYSIWYG editor based on ProseMirror & React
+ Live DEMO: http://cdn.summitlearning.org/assets/czi_prosemirror_0_0_1_1_20190509151928_index.html

---

## Getting Started

### Getting repository

```
git clone https://github.com/ciurescugeorge6/prose-editor
cd prose-editor
npm install
```


### Install dependencies
```
cd prose-editor
npm install
```

### Start the web server

```
# At the working directory `prose-editor`
npm start
```
Test http://localhost:3001/ from your browser

### Build the distribution files

```
# At the working directory `prose-editor`
npm run build:dist
```

## Development with React

```
import React from 'react';
import {createEmptyEditorState, EditorState, RichTextEditor} from 'prose-editor';

class Example extends React.PureComponent {

  constructor(props) {
    super(props, context);
    this.state = {
      editorState: createEmptyEditorState(),
    };
  }

  render() {
    const {editorState, editorView} = this.state;
    return (
      <RichTextEditor
        editorState={editorState}
        onChange={this._onChange}
      />
    );
  }

  _onChange = (editorState: EditorState): void => {
    this.setState({editorState});
  };
}

export default Example;
```



