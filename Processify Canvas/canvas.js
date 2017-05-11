/**
 * 
 * 
 */

 
/**
 * principles:
 * 1. put all id/class reference to the top of the code
 */
 
 var ExecutionStep = function() {
	this.type = 'e';
	this.name = '';
	this.description = '';
 }
 
 var EvaluationStep = function() {
	this.type = 'a';
	this.name = '';
 }
 
$(jsPlumb).ready(function() {
	/*
	 * jQuery Layout Setup
	 */
	$('body').layout({ applyDefaultStyles: true });
	
	/*
	 * Global Constants
	 */
	 
	var EXECUTION_STEP_FREFIX = "e";
	var EVALUATION_STEP_FREFIX = "a";
	
	var SOURCE_ENDPOINT_PREFIX = "se";
	var TARGET_ENDPOINT_PREFIX = "te";
	
	var EVALUATION_CONNECTION_PREFIX = "ac";
	
	var EVALUATION_CON_OVERLAY_PREFIX = "aco";
	
	/*
	 * Global Variables
	 */
	var controlDragged = false;	// control the creation of new step
	var currentStepIndex = 0;	// currently focused step (currently edited step)
	var currentStepPrefix = EXECUTION_STEP_FREFIX;	// currently focused step type
	var currentDraggedControl = null;
	var currentLabel = null; 	// currently focused evaluation option label
	
	var maxStepIndex = 0;		// the max index of the steps array
	
	var steps = new Array();	// array of steps
	var connections = new Array();  // array of connections: 1 => [cond1 => [2], cond2 => [3]] default is yes/no
	
	/*
	 * Canvas Widgets Initial Setup
	 */
	// detail forms
	var detailFormE = $("#form-e");
	detailFormE.hide();
	
	var formEStartDatePicker = $("#form-e-startdatepicker");
	formEStartDatePicker.datepicker();
	
	var detailFormA = $("#form-a");
	detailFormA.hide();
	
	// evaluation options
	var aOptions = $("#canvas-a-option");
	aOptions.hide();
	
	// step block template
	var stepETemplate = $("#step-e-template");
	stepETemplate.hide();
	
	/*
	 * jsPlumb Initial Setup
	 */
	jsPlumb.importDefaults({
		MaxConnections : -1
	});
	
	// connector properties
	var connectorCommon = {
		lineWidth: 2,
		strokeStyle: "green"
	};

	// source endpoint properties
	var endpointSource = {
		endpoint: "Dot",
		paintStyle: {
			strokeStyle:"green",
			fillStyle:"green",
			radius:4,
			lineWidth:2
		},
		isSource: true,
		cssClass: "sourceEndpoint",
		
		anchor: [[0.4, 1, 0, 1],	// bottom
				 [0, 0.4, -1, 0],	// left
				 [1, 0.6, 1, 0],	// right
				 [0.6, 0, 0, -1]],	// top. pay attention to the order of anchors, this will determine the preferred location
		
		connector: ["Flowchart", {stub: 20, cornerRadius: 5, gap: 3}],
		connectorStyle: connectorCommon,
	};
	
	// only for evaluation
	var endpointSourceE = {
		connectorOverlays: [["Arrow", {location: 1}]]
	};
	$.extend(endpointSourceE, endpointSource);
	var endpointSourceA = {
		connectorOverlays: [["Arrow", {location: 1}]]
	};
	$.extend(endpointSourceA, endpointSource);
	
	// target endpoint properties
	var endpointTarget = {
		endpoint: "Dot",
		paintStyle: {
			strokeStyle:"green",
			fillStyle:"white",
			radius:4,
			lineWidth:2
		},
		cssClass: "targetEndpoint",
		
		isTarget: true,
		
		anchor: [[0.4, 0, 0, -1],	// top
				 [1, 0.4, 1, 0],	// right
				 [0, 0.6, -1, 0],	// left
				 [0.6, 1, 0, 1]]	// bottom
	};
	
	// add endpoint to step block
	function addEndpoint(isExecution, stepId) {
		var eleId = (isExecution?EXECUTION_STEP_FREFIX:EVALUATION_STEP_FREFIX) + stepId;
		
		var sourceEndpointId = SOURCE_ENDPOINT_PREFIX + currentStepIndex;
		jsPlumb.addEndpoint(eleId, {uuid: sourceEndpointId}, isExecution?endpointSourceE:endpointSourceA);
		var targetEndpointId = TARGET_ENDPOINT_PREFIX + currentStepIndex;
		jsPlumb.addEndpoint(eleId, {uuid: targetEndpointId}, endpointTarget);
	}
	
	/*
	 * Toolbar Actions
	 */
	
	// Drag a step into canvas
	$("#tool-e-control").on("mousedown", function(event) {
		event.preventDefault();	// prevent the drag selection of tool bar area (which will blue the area)
		
		// drag a step on canvas
		controlDragged = true;
		currentStepPrefix = EXECUTION_STEP_FREFIX;
	});
	
	$("#tool-a-control").on("mousedown", function() {
		event.preventDefault();
	
		// drag a step on canvas
		controlDragged = true;
		currentStepPrefix = EVALUATION_STEP_FREFIX;
	});
	
	/*
	 * Topbar Actions
	 */
	
	$("#top-button-save").on("click", function(event) {
		console.log(steps);
		console.log(connections);
	})
	
	/*
	 * Details Form Actions
	 */
	 
	// Save user input into memory
	$("#form-e-save").on("click", function(event){
		event.preventDefault();
		
		// data
		retrieveExecutionFormData(currentStepIndex);
		
		// UI
		detailFormE.hide();
		
		populateExecutionStepUI(currentStepIndex)
			.done(jsPlumb.revalidate(EXECUTION_STEP_FREFIX + currentStepIndex));	// reposition anchor
		
		event.stopPropagation();
	});
	
	$("#form-e-delete").on("click", function(event){
		event.preventDefault();
		
		// data
		delete steps[currentStepIndex];	// will set to undefined
		delete connections[currentStepIndex];
		
		// UI
		jsPlumb.remove(EXECUTION_STEP_FREFIX + currentStepIndex);
		detailFormE.hide();
		
		event.stopPropagation();
	});
	
	$("#form-a-save").on("click", function(event){
		event.preventDefault();
		
		// data
		retrieveEvaluationFormData(currentStepIndex);
		
		// UI
		detailFormA.hide();
		
		populateEvaluationStepUI(currentStepIndex)
			.done(jsPlumb.revalidate(EVALUATION_STEP_FREFIX + currentStepIndex));
		
		event.stopPropagation();
	});
	
	$("#form-a-delete").on("click", function(event){
		event.preventDefault();
		
		// data
		delete steps[currentStepIndex];	// will set to undefined
		delete connections[currentStepIndex];
		
		// UI
		jsPlumb.remove(EVALUATION_STEP_FREFIX + currentStepIndex);
		detailFormA.hide();
		
		event.stopPropagation();
	});
	
	/*
	 * Canvas Actions
	 */
	
	// Following dragging a step into canvas, when mouse is released, a new step is created on canvas
	$("#canvas").on("mouseup", function(event) {
		
		if(controlDragged) {
			controlDragged = false;
			
			// check what's the step type
			var isExecution = (currentStepPrefix == EXECUTION_STEP_FREFIX);
			
			// create new step index, local to this process
			currentStepIndex = maxStepIndex;
			maxStepIndex ++;
			
			// create the step UI and bind action/data
			var eleId = currentStepPrefix + currentStepIndex;
			var stepUI = $("#step-"+ currentStepPrefix +"-template").clone().attr("id", eleId).show();
			stepUI.appendTo($("#canvas"));
			stepUI.offset({top: event.pageY, left: event.pageX});
			
			jsPlumb.draggable(eleId);
			
			// setup jsPlumb endpoints
			addEndpoint(isExecution, currentStepIndex);
			
			// create step data object
			steps[currentStepIndex] = isExecution?(new ExecutionStep()):(new EvaluationStep());
				
			// double click event
			stepUI.on("dblclick", doubleClickStepBlock);
		}
	});
	
	function doubleClickStepBlock(event) {
		var stepUIId = $(this).attr("id");
		
		currentStepIndex = parseInt(stepUIId.substr(1));
		if(isNaN(currentStepIndex)) {
			return;
		}
		var tmpStep = steps[currentStepIndex];
		if(!tmpStep) {
			return;
		}
		
		var isExecution = (tmpStep.type === "e")?true:false;
		
		// get the step block UI's location and canvas's information to get form location
		var tmpStepUI = $("#" + stepUIId);
		var containerTop = $("#canvas").offset().top;
		var containerLeft = $("#canvas").offset().left;
		
		// render form
		(isExecution?detailFormE:detailFormA).css({
			"top": tmpStepUI.offset().top - containerTop,
			"left": tmpStepUI.offset().left + tmpStepUI.outerWidth() + 10 - containerLeft 
		}).show();
			
		// fill in form data
		isExecution?populateExecutionForm(tmpStep):populateEvaluationForm(tmpStep);
	}

	/*
	 * Connection
	 */
	
	// new connection
	jsPlumb.bind("connection", function(info) {
		var sourceIndex = parseInt(info.sourceId.substr(1));
		var targetIndex = parseInt(info.targetId.substr(1));
		var connection = info.connection;
		
		if(!steps[sourceIndex]) {
			return;
		}
		if(!steps[targetIndex]) {
			return;
		}
		
		var isExecution = (steps[sourceIndex].type === 'e');
		
		if(isExecution) {
			if(connections[sourceIndex]) {
				if(connections[sourceIndex].yes.indexOf(targetIndex) == -1) {
					connections[sourceIndex].yes.push(targetIndex);
				}
			}
			else {
				connections[sourceIndex] = {
					yes: [targetIndex]
				}
			}
		}
		else {
			// add overlay label when connection established. easier to add customized ID
			connection.addOverlay(["Label", {
				location: 0.7,
				label: "Yes",
				id: sourceIndex + "to" + targetIndex,
				class: "cs-option-label",
				events: {
					dblclick: dblClickEvaluationConnection
				}
			}]);

			if(connections[sourceIndex]) { 
				if(connections[sourceIndex].yes.indexOf(targetIndex) == -1) {
					connections[sourceIndex].yes.push(targetIndex);
				}
			}
			else { 
				connections[sourceIndex] = {
					yes: [targetIndex],
					no: []
				}
			}
		}
	});
	
	// delete connection
	jsPlumb.bind("connectionDetached", function(info) {
		var sourceIndex = parseInt(info.sourceId.substr(1));
		var targetIndex = parseInt(info.targetId.substr(1));
		
		deleteTargetFromSource(sourceIndex, targetIndex)
	});
	
	// update connection
	jsPlumb.bind("connectionMoved", function(info) {
		var sourceIndex = parseInt(info.originalSourceId.substr(1));
		var targetIndexOld = parseInt(info.originalTargetId.substr(1));
		var targetIndexNew = parseInt(info.newTargetId.substr(1));
		
		var targetIndexYes = connections[sourceIndex].yes.indexOf(targetIndexOld);
		if(targetIndexYes != -1) {
			connections[sourceIndex].yes.splice(targetIndexYes, 1, targetIndexNew);
			return;
		}

		var targetIndexNo = connections[sourceIndex].no.indexOf(targetIndexOld);
		if(targetIndexNo != -1) {
			connections[sourceIndex].no.splice(targetIndexNo, 1, targetIndexNew);
		}
	});
	
	// double click evaluation connection
	function dblClickEvaluationConnection(labelOverlay, originalEvent) {
		originalEvent.preventDefault();
	
		currentLabel = labelOverlay;
	
		var containerTop = $("#canvas").offset().top;
		var containerLeft = $("#canvas").offset().left;
		
		aOptions.css({
			top: originalEvent.pageY - containerTop - 5,
			left: originalEvent.pageX - containerLeft - 5
		})
		aOptions.show();
	}
	
	$("#canvas-a-option-ok").on("click", function(event) {
		event.preventDefault();
		
		var option = $('input[name=a-option]:checked').val();
		
		// data
		var sourceAndDest = currentLabel.id.match(/^(\d+)to(\d+)$/);	// connection label's ID has format: sourceIdtoDestId, .e.g. 0to1
		var sourceIndex = parseInt(sourceAndDest[1])
			targetIndex = parseInt(sourceAndDest[2]);
		deleteTargetFromSource(sourceIndex, targetIndex);
		connections[sourceIndex][option].push(targetIndex);
		
		// UI
		currentLabel.setLabel(option);
		
		aOptions.hide();
		
		event.stopPropagation();
	});
	
	$("#canvas-a-option-cancel").on("click", function(event) {
		event.preventDefault();
		
		aOptions.hide();
		
		event.stopPropagation();
	});
	
	// helpers
	
	function deleteTargetFromSource(sourceId, targetId) {
		if(connections[sourceId]) {
			return;	// source element was deleted already
		}
	
		var targetIndexYes = connections[sourceId].yes.indexOf(targetId);
		if(targetIndexYes != -1) {
			connections[sourceId].yes.splice(targetIndexYes, 1);
			return;
		}

		var targetIndexNo = connections[sourceId].no.indexOf(targetId);
		if(targetIndexNo != -1) {
			connections[sourceId].no.splice(targetIndexNo, 1);
		}
	}
	
	/*
	 * Data/UI interaction
	 */
	
	// retrieve single execution form data from UI and fill into the step object
	function retrieveExecutionFormData(currentStepIndex) {
		if(!steps[currentStepIndex]) {
			steps[currentStepIndex] = new ExecutionStep();
		}
		steps[currentStepIndex].name = $("#form-e-name").val();
		steps[currentStepIndex].description = $("#form-e-description").val();
	}
	
	// populate the step data into the execution form
	function populateExecutionForm(step) {
		$("#form-e-name").val((!step.name)?"":step.name);
		$("#form-e-description").val((!step.description)?"":step.description);
	}
	
	// retrieve single execution form data from UI and fill into the step object
	function retrieveEvaluationFormData(currentStepIndex) {	
		if(!steps[currentStepIndex]) {
			steps[currentStepIndex] = new EvaluationStep();
		}
	
		steps[currentStepIndex].name = $("#form-a-name").val();
	}
	
	// populate the step data into the execution form
	function populateEvaluationForm(step) {
		$("#form-a-name").val((!step.name)?"":step.name);
	}
	
	/*
	 * Step block UI
	 */
	 	
	// generate the HTML step content that will fill into the step block
	function populateExecutionStepUI(currentStepIndex) {
		var step = steps[currentStepIndex];
		$("#" + EXECUTION_STEP_FREFIX + currentStepIndex + " > .cs-step-e-name").text(step.name);
		return $.Deferred().resolve();
	}
	
	function populateEvaluationStepUI(currentStepIndex) {
		
		var step = steps[currentStepIndex];
		console.log(step);
		$("#" + EVALUATION_STEP_FREFIX + currentStepIndex + " > .cs-step-a-name").text(step.name);
		return $.Deferred().resolve();
	}
	
	
	
	
	/*
	 * Utility
	 */
	 

});

