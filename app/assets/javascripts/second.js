function ShapesMap(_mapContainer, _deleteButton, _clearButton) {
	// default state of the variables
	var _selection = null;
	var _map = null;
	var _drawingManager = null;
	var _newShapeNextId = 0;
	var _shapes = Array();


	// variables for the possible shapes in Google Maps API
	var RECTANGLE = google.maps.drawing.OverlayType.RECTANGLE;
	var CIRCLE = google.maps.drawing.OverlayType.CIRCLE;
	var POLYGON = google.maps.drawing.OverlayType.POLYGON;
	var POLYLINE = google.maps.drawing.OverlayType.POLYLINE;
	var MARKER = google.maps.drawing.OverlayType.MARKER;

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
		// variable creating a new MVCArray (an object that Google provides natively)
		var path = new google.maps.MVCArray();

		// looping through array of path points for a polyline or polygon
		for (var i = 0; i < jsonPath.path.length; i++) {

			// creating a variable to hold the latitude and longitude of each point in a polyline or polygon path array
			var latlon = new google.maps.LatLng(jsonPath.path[i].lat, jsonPath.path[i].lon);

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
		var southWest = new google.maps.LatLng(jr.bounds.southWest.lat, jr.bounds.southWest.lon);

		// variable obtaining the latitude and longitude of the NorthEast point of the rectangle
		var northEast = new google.maps.LatLng(jr.bounds.northEast.lat, jr.bounds.northEast.lon);

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
		var center = new google.maps.LatLng(jc.center.lat, jc.center.lon);

		// variable for defining the circle options
		var circleOptions = {
			center: center,
			// this parses the radius of the circle (which is a float)
			radius: parseFloat(jc.radius),
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
		for (var i = 0; i < jsonPolygon.paths.length; i++) {

			// variable defining the points of each path on a polygon
			var path = jsonReadPath(jsonPolygon.paths[i]);

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
		var jsonObject = eval("(" + json + ")");

		for (i = 0; i < jsonObject.shapes.length; i++) {
			switch (jsonObject.shapes[i].type) {
				case RECTANGLE:
					var rectangle = jsonReadRectangle(jsonObject.shape[i]);
					newShapeSetProperties(rectangle, RECTANGLE);
					newShapeAddListeners(rectangle);
					shapesAdd(rectangle);
					break;

				case CIRCLE:
					var circle = jsonReadCircle(jsonObject.shapes[i]);
					newShapeSetProperties(circle, CIRCLE);
					newShapeAddListeners(circle);
					shapesAdd(circle);
					break;

				case POLYLINE:
					var polyline = jsonReadPolyline(jsonObject.shapes[i]);
					newShapeSetProperties(polyline, POLYLINE);
					newShapeAddListeners(polyline);
					shapesAdd(polyline);
					break;

				case POLYGON:
					var polygon = jsonReadPolygon(jsonObject.shapes[i]);
					newShapeSetProperties(polygon, POLYGON);
					newShapeAddListeners(polygon);
					shapesAdd(polygon);
					break;
			}
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

	// returns what typ of shape the object is as JSON
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
			jsonMakeType(RECTANGLE) + ','
			+ jsonMakeColor(rectangle.fillColor) + ','
			+ jsonMakeBounds(rectangle.bounds);

		return buf;
	}

	// concatenates the type, fill color of the object, center coordinates, and radius of a circle
	function jsonMakeCircle(circle) {
		var buf =
			jsonMakeType(CIRCLE) + ','
			+ jsonMakeColor(circle.fillColor) + ','
			+ jsonMakeCenter(circle.center) + ','
			+ jsonMakeRadius(circle.radius);

		return buf
	}

	// concatenates the type, color of the polyline, and the path points of a polyline
	function jsonMakePolyline(polyline) {
		var buf = 
			jsonMakeType(POLYLINE) + ','
			+ jsonMakeColor(polyline.fillColor) + ','
			+ jsonMakePath(polyline.getPath());

		return buf;
	}


	// concatenates the type, fill color of the polygon, and the paths of a polygon
	function jsonMakePolygon(polygon) {
		var buf =
			jsonMakeType(POLYGON) + ','
			+ jsonMakeColor(polygon.fillColor) + ','
			+ jsonMakePaths(polygon.getPaths());

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

		for (var i = 0; i < _shapes.length && !found; i++) {
			if (_shapes[i] === shape) {
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

		_shapes.splice(0, _shapes.length);
	}

	function shapesSave() {
		var shapes = jsonMake();

		// defining the expiration date of the cookie
		var expirationDate = new Date();
		expirationDate.setDate(expirationDate.getDate + 365);

		// this encodes the JSON created as a URI and lets the user know when the cookie expires
		var value = encodeURIComponent(shapes)
		+ "; expires=" + expirationDate.toUTCString();
		document.cookie = "shapes=" + value;
	}

	function shapesLoad() {
		var start_length = _shapes.length;

		var cookies = document.cookie.split(";");
		for (var i = 0; i < cookies.length; i++) {
			var key = cookies[i].substr(0, cookies[i].indexOf("="));
			key = key.replace("/^\s+|\s+$/g", "");

			if (key == "shapes") {
				var value = cookies[i].substr(cookies[i].indexOf("=") + 1);

				jsonRead(decodeURIComponent(value));
			}
		}

		var n_loaded = _shapes.length - start_length;
		print(n_loaded + " shapes loaded\n");
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
		}

		selectionPrint();
	}

	function selectionClear() {
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
					function() {onShapeEdited(shape);});
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
	// }

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
			editable: true
		};

		drawingManagerOptions = {
			drawingMode: null,
			drawingControlOptions: drawingControlOptions,
			markerOptions: { draggable: true },
			polylineOptions: { editable: true },
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
		shapesSave()
		selectionSet(shape);

		print("new " + typeDesc(event.type) + " created (id = " + shape.appId + ")\n");
	}

	function onShapeEdited(shape) {
		print(shape.appId + " : shape edited\n");
		shapesSave();
	}

	function onShapeClicked(shape) {
		print(shape.appId + " : shape clicked\n");
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