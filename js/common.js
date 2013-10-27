var flickrApiUrl = 'http://api.flickr.com/services/rest/?jsoncallback=?';

var downloadr = function(){
	return {
		getData: function(photoset_id,action){
			$.getJSON(flickrApiUrl,{
				format:'json',
				api_key:'801db5f6223c6b1124e2b45874ec8214',
				photoset_id:photoset_id,
				method:'flickr.photosets.getPhotos',
				extras: 'url_s,url_m,url_l,url_o',
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
					console.log(newImgUrl);
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
				imgURL = 'http://farm'+this.farm+'.staticflickr.com/'+this.server+'/'+this.id+'_'+this.secret+'.jpg';
				if(size == "default"){
					$( "<img>" ).attr("src",imgURL).appendTo( "#content" );
				}else{				 			
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
					$("<img>").attr({src:imgURL,sub:isSub}).appendTo("#content");
				}
			});
		
			if(size != 'max' && showSubWarn && $('#sizeAlert').prop('checked')){
				$('img[sub="true"]').css('border','2px solid red');	
				$('#content').prepend("<p>Images with a red border may not be the size you requested due to the size not being available.</p>");									
			}		
		},
		saveImages: function(fileURL,fileName){
			var imgURL,fileURL,fileName,size;
			size = $("#size option:selected").val();

			if(size == "default"){
				$.each(downloadr.data.photoset.photo,function(){
					imgURL = 'http://farm'+this.farm+'.staticflickr.com/'+this.server+'/'+this.id+'_'+this.secret+'.jpg';
					downloadr.downloadFiles(imgURL,this.title);
				});
			}else{				
				imgURL = eval("this.url"+"_"+size);
				$.each(downloadr.data.photoset.photo,function(){					
					downloadr.downloadFiles(imgURL,this.title);
				});				
			}

		},

		downloadFiles: function(fileURL,fileName){
				if (!window.ActiveXObject) {
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
						var _window = window.open(fileURL, '_blank');
						_window.document.close();
						_window.document.execCommand('SaveAs', true, fileName || fileURL)
						_window.close();
				}
		}

	}
}();

$(function(){
	$('#button').click(function(){
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

	$('#button_download').click(function(){
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
	});


});