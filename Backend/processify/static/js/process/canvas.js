/**
 * 
 */

$(document).ready(function() {
	// variables
	var controlDragged = false;	// control the creation of new step
	var currentStepIndex = 0;	// currently focused step (currently edited step)
	var maxStepIndex = 0;		// the max index of the steps array
	
	// array of steps data
	// for below two arrays, once an element is deleted, it is set to undefined
	var steps = new Array();
	var stepUIs = new Array();
	
	// details form
	var detailForm = $("#detail-form");
	detailForm.hide();
	
	$("#save-detail-button").on("click", function(event){
		
		// data
		var step = {
			'name': $("#id_name").val(),
			'description': $("#id_description").val()
		};
		steps[currentStepIndex] = step;	// save any modification back
		
		// UI
		var tmpStepUI = stepUIs[currentStepIndex];
		tmpStepUI.html("<span>" + step.name + "</span>");
		tmpStepUI.draggable("enable"); // enable dragging element after editting the step
		detailForm.hide();
		
		event.stopPropagation();
	});
	
	$("#delete-step-button").on("click", function(event){
		
		// data
		delete steps[currentStepIndex];	// will set to undefined
		
		// UI
		// TO CONSIDER: detain the element instead, to allow unwind?
		var tmpStepUI = stepUIs[currentStepIndex];
		tmpStepUI.remove();
		delete stepUIs[currentStepIndex];	// will set to undefined
		
		detailForm.hide();
		
		event.stopPropagation();
	});
	
	$("#execution-step-control").on("mousedown", function() {
		// drag a step on canvas
		controlDragged = true;
	});
	
	$("#canvas").on("mouseup", function(event) {
		// create new step
		if(controlDragged) {
			controlDragged = false;
			
			// create the step UI and bind action/data
			var stepUI = $("<div></div>", {
				"class": "evecution-step"
			});
			stepUI.appendTo($("#canvas"));
			stepUI.offset({top: event.pageY, left: event.pageX});
			stepUI.draggable();
			
			// put into steps array
			currentStepIndex = maxStepIndex;
			stepUI.data('internalIndex', currentStepIndex);
			stepUIs[currentStepIndex] = stepUI;
			var tmpStep = {
				'name': "",
				'description': ""
			};
			steps[currentStepIndex] = tmpStep;
			maxStepIndex++;
			
			// double click event
			stepUI.on("dblclick", function(event) {
				//  double click step set the currently selected step - will be used in OK button action
				currentStepIndex = $(this).data("internalIndex");
				
				// render detailForm UI
				var tmpStepUI = stepUIs[currentStepIndex];

				// detailForm css is relative to canvas (as detailForm is absolute position)
				// while tmpStepUI is relative to document
				// so need to adjust the document offset
				// also below left there's a buffer = 40. not sure why
				var canvasTop = $("#canvas").offset().top;
				var canvasLeft = $("#canvas").offset().left;
				detailForm.css({
					"top": tmpStepUI.offset().top - canvasTop,
					"left": tmpStepUI.offset().left + tmpStepUI.width() + 30 - canvasLeft
				});
				detailForm.show();
				
				// fill in detailForm data
				var tmpStep = steps[currentStepIndex];
				if(tmpStep != undefined) {
					$("#id_name").val((tmpStep.name == undefined)?"":tmpStep.name);
					$("#id_description").val((tmpStep.description == undefined)?"":tmpStep.description);
				}
				
				// lock the element position during editing. enabled in detailForm OK action
				$(this).draggable("disable");
			});
		}
	});
});