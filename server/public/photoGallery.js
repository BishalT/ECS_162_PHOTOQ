
/* This array is just for testing purposes.  You will need to
   get the real image data using an AJAX query. */

const photos = [
  {src: "", height:0, width:0, landmark:"", tags:[]}
];

function deleteTagServer(idNum, tag){
    var xhr = new XMLHttpRequest();
    var reqQuery = idNum +","+tag;
    console.log(reqQuery);
    xhr.open("GET", "/query?delTag=" + encodeURI(reqQuery).replace(/ |,/g, "+"));
    xhr.send();
}


// A react component for a tag
class Tag extends React.Component {

    render () {
	return React.createElement('p',  // type
	    { className: 'tagText'}, // properties
	       this.props.tag);  // contents
    }
};


// A react component for controls on an image tile
class TileControl extends React.Component {
    constructor(props) {
      super(props);
      this.state = { tags: props.Tags };
    }

    deleteTag(index, event){
        event.stopPropagation();
        var delTag = this.state.tags.splice(index,1);
        this.setState({tags: this.state.tags});
        deleteTagServer(this.props.IdNum, delTag);
        console.log("tag onclick");
    }

    render () {
        // remember input vars in closure
        var _selected = this.props.selected;
        var _src = this.props.src;
        var _tags = this.props.Tags;

        var tagList = [];
        tagList.push( 'div' );
        tagList.push( { className: _selected ? 'selectedControls' : 'normalControls'} )

        for (var index = 0; index < _tags.length; index++){
            tagList.push(
                React.createElement('div',
        	        {  className: _tags[index],
                        onClick: this.deleteTag.bind(this, index)},

                React.createElement(Tag, {tag: _tags[index], key:_tags[index] + index})
            ));
        }

        return ( React.createElement.apply(null, tagList) );

        // div contents - so far only one tag
        // return (
        //     React.createElement('div',
    	//           {className: _selected ? 'selectedControls' : 'normalControls'},
        //       React.createElement(Tag,
    	//                 {
        //                     tag: _tags[0],
        //                 })
        //             )// createElement div
        //         )// return
             } // render
};


// A react component for an image tile
class ImageTile extends React.Component {
    render() {
	// onClick function needs to remember these as a closure
	var _onClick = this.props.onClick;
	var _index = this.props.index;
	var _photo = this.props.photo;
	var _selected = _photo.selected; // this one is just for readability
	return (
	    React.createElement('div',
	        {style: {margin: this.props.margin, width: _photo.width},
			 className: 'tile',
                         onClick: function onClick(e) {
			    console.log("tile onclick");
			    // call Gallery's onclick
			    return _onClick (e,
					     { index: _index, photo: _photo })
				}
		 }, // end of props of div
		 // contents of div - the Controls and an Image
		React.createElement(TileControl,
		    {selected: _selected,
		     src: _photo.src,
             Landmark: _photo.landmark,
             IdNum: _photo.idNum,
             Tags: _photo.tags}),
		React.createElement('img',
		    {className: _selected ? 'selected' : 'normal',
                     src: _photo.src,
		             width: _photo.width,
                     height: _photo.height
			    })
				)//createElement div
	); // return
    } // render
} // class


// The react component for the whole image gallery
// Most of the code for this is in the included library
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { photos: photos };
    this.selectTile = this.selectTile.bind(this);
  }

  selectTile(event, obj) {
    console.log("in onclick!", obj);
    let photos = this.state.photos;
    photos[obj.index].selected = !photos[obj.index].selected;
    this.setState({ photos: photos });
  }

  render() {
    return (
       React.createElement( Gallery,
           {
               photos: this.state.photos,
               onClick: this.selectTile,
               ImageComponent: ImageTile
           })
      );
  }
}

/* Finally, we actually run some code */

const reactContainer = document.getElementById("react");
var reactApp = ReactDOM.render(React.createElement(App),reactContainer);

/* Workaround for bug in gallery where it isn't properly arranged at init */
window.dispatchEvent(new Event('resize'));

function updateImages()
{
  var reqIndices = document.getElementById("req-text").value;

  if (!reqIndices) return; // No query? Do nothing!

  var xhr = new XMLHttpRequest();

  xhr.open("GET", "/query?keyList=" + encodeURI(reqIndices).replace(/ |,/g, "+"));
  xhr.addEventListener("load", (evt) => {
    if (xhr.status == 200) {
        reactApp.setState({photos:JSON.parse(xhr.responseText)});
        window.dispatchEvent(new Event('resize')); /* The world is held together with duct tape */
    } else {
        console.log("XHR Error!", xhr.responseText);
    }
  } );
  xhr.send();
}

function tagOnclick (obj, e) {
    console.log("obj");
}
