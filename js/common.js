var flickrApiUrl = 'http://api.flickr.com/services/rest/?jsoncallback=?';

var downloadr = function(){
	return {
		getData: function(photoset_id,action){
			$.getJSON(flickrApiUrl,{
				format:'json',
				api_key:'801db5f6223c6b1124e2b45874ec8214',
				photoset_id:photoset_id,
				method:'flickr.photosets.getPhotos',
				extras: 'path_alias,url_s,url_m,url_l,url_o',
			per_page:1000})
			.done(function(data){
				downloadr.data = data;

				if(action == 'save'){
					downloadr.saveImages();
				}else if(action == 'render'){
					downloadr.renderImages();
				}

			});
		},
		findMaxSize: function(curImg,sizeList){
				var newImgURL = '';
				$.each(sizeList.reverse(),function(index,value){
					newImgUrl = eval("curImg.url"+"_"+value);
					if(newImgUrl != undefined){
						return false;
					};
				});
				return newImgUrl;
		},
		renderImages: function(){
			var imgURL,html,size,curSize,isSub,showSubWarn;
			size = $("#size option:selected").val();
			$.each(downloadr.data.photoset.photo,function(){
				imgURL = eval("this.url"+"_"+size);
				isSub = false;
				if(imgURL == undefined){
					sizeList = [];
					$('#size option').each(function() {
						sizeList.push($(this).val())
					});
					imgURL = downloadr.findMaxSize(this,sizeList);
					isSub = true;
					showSubWarn = true;
				};
								
				$("#content").append($("<a>", 
				{
				    href: 'http://www.flickr.com/photos/'+this.pathalias+'/'+this.id, 
				    html: $("<img>", {src:imgURL,'data-sub':isSub,style:'display:none'}).fadeIn("slow"),
				    target:'_new'
				}));
			});

			if(size != 'max' && showSubWarn){
				$('img[data-sub="true"]').css('border','2px solid red');
				$('#content').prepend("<p>Images with a red border were not available in the size you requested.  The closest size was provided.</p>");
			}
		},
		saveImages: function(){
			var imgURL,fileName,size;
			size = $("#size option:selected").val();

			$.each(downloadr.data.photoset.photo,function(){
				imgURL = eval("this.url"+"_"+size);
				fileName = imgURL.split('/');
				fileName = fileName[fileName.length-1];
				downloadr.downloadFiles(imgURL,fileName);
			});
		},

		downloadFiles: function(fileURL,fileName){
				if (!window.ActiveXObject) {
					console.log(1);
					var save = document.createElement('a');
					save.href = fileURL;
					save.target = '_blank';
					save.download = fileName || 'unknown';

					var event = document.createEvent('Event');
					event.initEvent('click', true, true);
					save.dispatchEvent(event);
					(window.URL || window.webkitURL).revokeObjectURL(save.href);
				}

				// for IE
				else if ( !! window.ActiveXObject && document.execCommand)     {
						console.log(2);
						var _window = window.open(fileURL, '_blank');
						_window.document.close();
						_window.document.execCommand('SaveAs', true, fileName || fileURL)
						_window.close();
				}
		}

	}
}();

$(function(){
	$('#button_get').click(function(){
		var photoset_id;
		$('#content').html('');
		if($('#photoset_id').val()){
			photoset_id = $('#photoset_id').val();
		}else{
			var idArray = $('#photoset_URL').val().split('/');
			photoset_id = idArray[idArray.length-2];
		}

		if(typeof(photoset_id)!="undefined"){
			downloadr.getData(photoset_id,'render');
		}else{
			alert('You must specify a set ID or Set URL');
		}
	});

	var is_chrome = window.chrome;	
	if(!is_chrome){
		$('#button_download').attr({"disabled":"disabled",title:"Currently only working in Chrome"});		
	}
	
	$('#button_download').click(function(){
		var c,photoset_id;

		c = confirm("Saving images will burst download images to your local download folder.\n\nContinue?");

		if(c){
			if($('#photoset_id').val()){
				photoset_id = $('#photoset_id').val();
			}else{
				var idArray = $('#photoset_URL').val().split('/');
				photoset_id = idArray[idArray.length-2];
			}

			if(typeof(photoset_id)!="undefined"){
				downloadr.getData(photoset_id,'save');
			}else{
				alert('You must specify a set ID or Set URL');
			}
		}
	});
	
	
	$('#preview').click(function(){
		$('#photoset_id').val('72157631324774046');
		$('#button_get').click();
	});
});
