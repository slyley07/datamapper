function ShapesMap(_mapContainer, _deleteButton, _clearButton) {
	// default state of the variables
	var _selection = null;
	var _map = null;
	var _drawingManager = null;
	var _newShapeNextId = 0;
	var _shapes = Array();
	var _point = 0;
	var _newText = null;
	var _json = null;


	// variables for the possible shapes in Google Maps API
	// allows the shapes to be created on the map
	var RECTANGLE = google.maps.drawing.OverlayType.RECTANGLE;
	var CIRCLE = google.maps.drawing.OverlayType.CIRCLE;
	var POLYGON = google.maps.drawing.OverlayType.POLYGON;
	var POLYLINE = google.maps.drawing.OverlayType.POLYLINE;
	var MARKER = google.maps.drawing.OverlayType.MARKER;
	var infoWindow = new google.maps.InfoWindow

	// assigns what type of shape it is to the JSON
	// also allows for easy selecting
	function typeDesc(type) {
		switch (type) {
			case RECTANGLE:
				return "rectangle";

			case CIRCLE:
				return "circle";

			case POLYGON:
				return "polygon";

			case POLYLINE:
				return "polyline";

			case MARKER:
				return "marker";

			case null:
				return "null";

			default:
				return "Unknown Google Maps overlay type!";
		}
	}

	// reading the JSON
	// function for defining the paths of a polyline or polygon object
	function jsonReadPath(jsonPath) {
		// variable creating a new MVCArray (an object that Google Maps API provides natively)
		// this variable is where each path is placed in the map
		var path = new google.maps.MVCArray();

		// looping through array of path points for a polyline or polygon
		for (var i = 0; i < jsonPath.length; i++) {

			// creating a variable to hold the latitude and longitude of each point in a polyline or polygon path array
			var latlon = new google.maps.LatLng(parseFloat(jsonPath[i]["lat"]), parseFloat(jsonPath[i]["lon"]));


			// pushing each instance of the variable into the path array
			path.push(latlon);
		}
		return path;
	}

	// function for defining the bounds of a rectangle object
	function jsonReadRectangle(jsonRectangle) {
		// variable shortening the jsonRectangle argument
		var jr = jsonRectangle;

		// variable obtaining the latitude and longitude of the SouthWest point of the rectangle
		var southWest = new google.maps.LatLng(parseFloat(jr[0]["bounds"]["southWest"]["lat"]), parseFloat(jr[0]["bounds"]["southWest"]["lon"]));

		// variable obtaining the latitude and longitude of the NorthEast point of the rectangle
		var northEast = new google.maps.LatLng(parseFloat(jr[0]["bounds"]["northEast"]["lat"]), parseFloat(jr[0]["bounds"]["northEast"]["lon"]));

		// variable pulling the southWest and northEast variables into a coordinate format
		var bounds = new google.maps.LatLngBounds(southWest, northEast);

		// variable defining the rectangle options
		var rectangleOptions = {
			bounds: bounds,
			editable: false,
			fillColor: jr.color,
			map: _map
		};

		var rectangle = new google.maps.Rectangle(rectangleOptions);
		return rectangle;
	}

	// function for defining the center and radius of a circle object
	function jsonReadCircle(jsonCircle) {
		// variable shortening the jsonCircle argument
		var jc = jsonCircle;

		// variable for defining the center coordinate of the circle
		var center = new google.maps.LatLng(parseFloat(jc["cords"]["center"]["lat"]), parseFloat(jc["cords"]["center"]["lon"]));

		// variable for defining the circle options
		var circleOptions = {
			center: center,
			// this parses the radius of the circle (which is a float)
			radius: parseFloat(jc["cords"]["radius"]),
			editable: false,
			fillColor: jc.color,
			map: _map
		};

		var circle = new google.maps.Circle(circleOptions);
		return circle;
	}

	// function for defining the path of a polyline object
	function jsonReadPolyline(jsonPolyline) {
		// variable defining the points on the path that the polyline has
		var path = jsonReadPath(jsonPolyline);

		// variable defining the polyline options
		var polylineOptions = {
			path: path,
			editable: false,
			strokeColor: jsonPolyline.color,
			map: _map,
		};

		var polyline = new google.maps.Polyline(polylineOptions);

		return polyline;
	}

	// function for defining the paths of a polygon object
	function jsonReadPolygon(jsonPolygon) {
		// variable creating an empty Google MVCArray (an object provided by Google API)
		var paths = new google.maps.MVCArray();

		// loop for pushing all of the points of the polygon into an MVCarray
		for (var i = 0; i < jsonPolygon.length; i++) {
			// variable defining the points of each path on a polygon
			var path = jsonReadPath(jsonPolygon);
			// pushing the individual path into the MVCArray
			paths.push(path);
		}
		// variable for defining the polygon options
		var polygonOptions = {
			paths: paths,
			editable: false,
			fillColor: jsonPolygon.color,
			map: _map
		};

		var polygon = new google.maps.Polygon(polygonOptions);
		return polygon;
	}

	function jsonRead(json) {
		if (json[0]["type"] === "circle") {
			var circle = jsonReadCircle(json[0]);
			newShapeSetProperties(circle, CIRCLE);
			newShapeAddListeners(circle);
			shapesAdd(circle);
		} else if (json[0].type === "rectangle") {
			var rectangle = jsonReadRectangle(json);
			newShapeSetProperties(rectangle, RECTANGLE);
			newShapeAddListeners(rectangle);
			shapesAdd(rectangle);
		} else if (json[0].type === "polyline") {
			var polyline = jsonReadPolyline(json[0]["path"]);
			newShapeSetProperties(polyline, POLYLINE);
			newShapeAddListeners(polyline);
			shapesAdd(polyline);
		} else if (json[0]["type"] === "polygon") {
			var polygon = jsonReadPolygon(json[0]["paths"][0]["path"]);
			newShapeSetProperties(polygon, POLYGON);
			newShapeAddListeners(polygon);
			shapesAdd(polygon);
		}
	}

	// writing the JSON

	// for adding commas between indices in an array
	function comma(i) {
		return (i > 0) ? ',' : '';
	}

	// returns the latitude and longitude of an object as JSON
	function jsonMakeLatlon(latlon) {
		var buf = '"lat":"' + latlon.lat() + '","lon":"' + latlon.lng() +'"';

		return buf;
	}

	// returns the bounds (defined by the NorthEast and SouthWest corners) of a rectangle as JSON
	function jsonMakeBounds(bounds) {
		var buf =
			'"bounds":{'
			+ '"northEast":{' + jsonMakeLatlon(bounds.getNorthEast()) + '},'
			+ '"southWest":{' + jsonMakeLatlon(bounds.getSouthWest()) + '}'
			+ '}';

			return buf;
	}

	// returns what type of shape the object is as JSON
	function jsonMakeType(type) {
		var buf = '"type":"' + typeDesc(type) + '"';

		return buf;
	}

	// returns the fill color of the object as JSON
	function jsonMakeColor(color) {
		var buf = '"color":"' + color + '"';
		return buf;
	}

	// returns the coordinates of the center of a circle as JSON
	function jsonMakeCenter(center) {
		var buf = '"center":{' + jsonMakeLatlon(center) + '}';

		return buf;
	}

	// returns the radius of the circle as JSON
	function jsonMakeRadius(radius) {
		var buf = '"radius":"' + radius + '"';

		return buf;
	}

	// returns the path points of a polyline as JSON
	function jsonMakePath(path) {
		var n = path.getLength();

		var buf = '"path":[';
		for (var i = 0; i < n; i++) {
			var latlon = path.getAt(i);

			buf += comma(i) + '{' + jsonMakeLatlon(latlon) + '}';
		}

		buf += ']';

		return buf;
	}

	// returns the path points of all of the paths of a polygon as JSON
	function jsonMakePaths(paths) {
		var n = paths.getLength();

		var buf = '"paths":[';
		for (var i = 0; i < n; i++) {
			var path = paths.getAt(i);

			buf += comma(i) + '{' + jsonMakePath(path) + '}';
		}

		buf += ']';

		return buf;
	}

	// concatenates the type, fill color of the object, and the bounds of a rectangle
	function jsonMakeRectangle(rectangle) {
		var buf =
			'"' + rectangle.appId + '":{'
			+	jsonMakeType(RECTANGLE) + ','
			+ jsonMakeColor(rectangle.fillColor) + ','
			+ jsonMakeBounds(rectangle.bounds) + '}';

		return buf;
	}

	// concatenates the type, fill color of the object, center coordinates, and radius of a circle
	function jsonMakeCircle(circle) {
		var buf =
			'"' + circle.appId + '":{'
			+ jsonMakeType(CIRCLE) + ','
			+ jsonMakeColor(circle.fillColor) + ','
			+ '"cords":{' + jsonMakeCenter(circle.center) + ','
			+ jsonMakeRadius(circle.radius) + '}}';

		return buf
	}

	// concatenates the type, color of the polyline, and the path points of a polyline
	function jsonMakePolyline(polyline) {
		var buf =
			'"' + polyline.appId + '":{'
			+ jsonMakeType(POLYLINE) + ','
			+ jsonMakeColor(polyline.fillColor) + ','
			+ jsonMakePath(polyline.getPath()) + '}';

		return buf;
	}


	// concatenates the type, fill color of the polygon, and the paths of a polygon
	function jsonMakePolygon(polygon) {
		var buf =
			'"' + polygon.appId + '":{'
			+ jsonMakeType(POLYGON) + ','
			+ jsonMakeColor(polygon.fillColor) + ','
			+ jsonMakePaths(polygon.getPaths()) + '}';

		return buf;
	}

	// concatenates all of the overlay shapes on a map together into the JSON format
	function jsonMake() {
		// variable for starting out the JSON
		var buf = '{"shapes":[';

		// looping through all of the shapes on a map
		for (i = 0; i < _shapes.length; i++) {

			// switching between the types of shapes
			switch (_shapes[i].type)
			{
				case RECTANGLE:
					// concatenating the jsonMakeRectangle function onto the end of the 'buf' variable
					buf += comma(i) + '{' + jsonMakeRectangle(_shapes[i]) + '}';
					break;

				case CIRCLE:
					// concatenating the jsonMakeCircle function onto the end of the 'buf' variable
					buf += comma(i) + '{' + jsonMakeCircle(_shapes[i]) + '}';
					break;

				case POLYLINE:
					// concatenating the jsonMakePolyline function onto the end of the 'buf' variable
					buf += comma(i) + '{' + jsonMakePolyline(_shapes[i]) + '}';
					break;

				case POLYGON:
					// concatenating the jsonMakePolygon function onto the end of the 'buf' variable
					buf += comma(i) + '{' + jsonMakePolygon(_shapes[i]) + '}';
					break;
			}
		}

		// concatenating the closing bracket and brace for the JSON
		buf += ']}';

		return buf;
	}

	// storage of the shapes
	function shapesAdd(shape) {
		_shapes.push(shape);
	}

	function shapesDelete(shape) {
		var found = false;
		console.log(shape);
		$.ajax({
			 type: "DELETE",
			 url: "/plots",
			 dataType: "json",
			 data: shape,
			 complete: function(){
				 	console.log("yay");
					shapesSave();
			 }
	 });

		for (var i = 0; i < _shapes.length && !found; i++) {
			if (_shapes[i] === shape) {
				infoClose();
				_shapes.splice(i, 1);
				found = true;
			}
		}
	}

	function shapesHideAll() {
		for (var i = 0; i < _shapes.length; i++) {
			// calling 'setMap(null)' on an object makes the object hidden on the map
			_shapes[i].setMap(null);
		}
	}

	function shapesDeleteAll() {
		print(_shapes.length + " shapes deleted\n");
		infoClose();
		_shapes.splice(0, _shapes.length);
	}

	function shapesSave() {
		var shapes = jsonMake();

		var ready = function(){
				$.ajax({
					type: "POST",
					url: "/plots",
					dataType: 'json',
					contentType: 'application/json',
					data: JSON.stringify(shapes)
				});
		}
		$(document).ready(ready);
		$(document).on('page:load', ready);
	}

	// function for loading the shapes
	function shapesLoad() {
		var start_length = _shapes.length;

		var ready = function(){
			$.ajax({
				type: "GET",
				url: "/plots",
				dataType: "json",
				success: function(plots) {
					for (i = 0; i < plots.json.length; i++) {
						jsonRead(plots.json[i].json);
					}
				}
			})
		}

		$(document).ready(ready());
		$(document).on('page:load', ready);
	}

	// printing all information to the console!
	function print(string) {
		console.log(string);
	}

	function printDrawingMode(drawingManager) {
		print(
			"drawing mode set to "
			+ typeDesc(drawingManager.getDrawingMode())
			+ "\n");
	}

	//selecting specific shapes
	function selectionPrint() {
		if (_selection == null) {
			print("selection cleared\n");
		}
		else {
			print(_selection.appId + ": selected\n");
		}
	}

	function selectionIsSet() {
		return _selection != null;
	}

	function selectionSet(newSelection) {
		infoClose(_selection);
		if (newSelection == _selection) {
			return;
		}

		if (_selection != null) {
			_selection.setEditable(false);
			_selection = null;
		}

		if (newSelection != null) {
			_selection = newSelection;
			_selection.setEditable(true);
			createInfoWindow(_selection);
		}

		selectionPrint();
	}

	function selectionClear() {
		infoClose(_selection);
		selectionSet(null);
	}

	function selectionDelete() {
		if (_selection != null) {
			_selection.setMap(null);
			selectionClear;
		}
	}

	// adding new shapes to the map!
	function newShapeAddPathListeners(shape, path) {
		google.maps.event.addListener(
			path,
			'insert_at',
			function() {onShapeEdited(shape)});

		google.maps.event.addListener(
			path,
			'remove_at',
			function() {onShapeEdited(shape)});

		google.maps.event.addListener(
			path,
			'set_at',
			function() {onShapeEdited(shape)});
	}

	function newShapeAddListeners(shape) {
		google.maps.event.addListener(
			shape,
			'click',
			function() {onShapeClicked(shape);});

		switch (shape.type) {
			case RECTANGLE:
				google.maps.event.addListener(
					shape,
					'bounds_changed',
					function() {
						onShapeEdited(shape);
						});
				break;

			case CIRCLE:
				google.maps.event.addListener(
					shape,
					'center_changed',
					function() {onShapeEdited(shape);});
				google.maps.event.addListener(
					shape,
					'radius_changed',
					function() {onShapeEdited(shape);});
				break;

			case POLYLINE:
				var path = shape.getPath();
				newShapeAddPathListeners(shape, path);
				break;

			case POLYGON:
				var paths = shape.getPaths();

				var n = paths.getLength();
				for (var i = 0; i < n; i++) {
					var path = paths.getAt(i);
					newShapeAddPathListeners(shape, path);
				}
				break;
		}
	}

	function newShapeSetProperties(shape, type) {
		shape.type = type;
		shape.appId = _newShapeNextId;

		_newShapeNextId++;
	}

	function createInfoWindow(shape) {
		infowindow = new google.maps.InfoWindow;

		var html = $('.thang').html();

		var options = {
			html: html
		}

		google.maps.event.addListener(shape, 'click', function(event) {
				infowindow.setOptions({
					content: options.html,
					position: event.latLng
				});
				infowindow.open(_map, shape)
			});
  }

	function infoClose(shape) {
    infoWindow.close();
	}

	// creating the map!!!
	function createMap(mapContainer) {
		var center = new google.maps.LatLng(40.7127, -74.0059);

		var mapOptions = {
			zoom: 8,
			center: center,
			mapTypeId: google.maps.MapTypeId.TERRAIN,
			disableDefaultUI: true,
		}

		var map = new google.maps.Map(mapContainer, mapOptions);
		google.maps.event.addListener(map, 'click', onMapClicked);
		return map;
	}

	//creating the drawing manager!
	function drawingManagerCreate() {
		// create drawing manager

		var drawingModes = new Array(RECTANGLE, CIRCLE, POLYGON, POLYLINE);

		var drawingControlOptions = {
			drawingModes: drawingModes,
			position: google.maps.ControlPosition.TOP_CENTER
		};

		var polyOptions = {
			draggable: true,
			editable: true
		};

		drawingManagerOptions = {
			drawingMode: null,
			drawingControlOptions: drawingControlOptions,
			markerOptions: { draggable: true },
			polylineOptions: { draggable: true, editable: true, strokeWeight: 5 },
			rectangleOptions: polyOptions,
			circleOptions: polyOptions,
			polygonOptions: polyOptions,
			map: _map
		}

		drawingManager = new google.maps.drawing.DrawingManager(drawingManagerOptions);

		//tying events to maps
		google.maps.event.addListener(
			drawingManager,
			'overlaycomplete',
			onNewShape);
		google.maps.event.addListener(
			drawingManager,
			'drawingmode_changed',
			onDrawingModeChanged);

		//print initial drawing mode and selection
		printDrawingMode(drawingManager);
		selectionPrint();

		return drawingManager;
	}

	// event capture
	function onNewShape(event) {
		var shape = event.overlay;

		newShapeSetProperties(shape, event.type);
		newShapeAddListeners(shape);
		shapesAdd(shape);
		shapesSave();
		selectionSet(shape);

		print("new " + typeDesc(event.type) + " created (id = " + shape.appId + ")\n");
	}

	function onShapeEdited(shape) {
		print(shape.appId + ": shape edited\n");
		shapesSave();
	}

	function onShapeClicked(shape) {
		print(shape.appId + ": shape clicked\n");
		selectionSet(shape);
	}

	function onMapClicked() {
		print("map clicked\n");
		selectionClear();
	}

	function onDeleteButtonClicked() {
		print("delete button clicked\n");

		if (selectionIsSet()) {
			shapesDelete(_selection);
			shapesSave();
			selectionDelete();
		}
	}

	function onClearButtonClicked() {
		print("clear button clicked\n");

		selectionClear();
		shapesHideAll();
		shapesDeleteAll();
		shapesSave();
	}

	function onDrawingModeChanged() {
		printDrawingMode(drawingManager);
		selectionClear();
	}

	function onCreate() {
		_map = createMap(_mapContainer);
		_drawingManager = drawingManagerCreate(_map);

		google.maps.event.addDomListener(
			_deleteButton,
			'click',
			onDeleteButtonClicked);
		google.maps.event.addDomListener(
			_clearButton,
			'click',
			onClearButtonClicked);

		shapesLoad();
	}

	onCreate();
}
