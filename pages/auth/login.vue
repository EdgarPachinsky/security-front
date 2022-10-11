<template>
  <b-form>
    <b-row>
      <b-col sm="12" md="6" lg="6">

        <canvas id="documentcanvas" style="display: none"></canvas>
        <p>لطفا شماره پاسپورت خود را وارد کنید و صورت خود را اسکن کنید</p>
        <b-form-group id="input-group-1" label="شماره پاسپورت:" label-for="passport_no">
          <b-form-input
            id="passport_no"
            v-model="passportNo"
            type="text"
            placeholder="شماره پاسپورت"
            required
          ></b-form-input>
        </b-form-group>
        <b-form-select id="cameraList" class="mb-4" @change="startCamera()"></b-form-select>


        <div class="col-6 pl-0" id="scannerContainer">
          <video id="cameraDisplay" v-show="!scanned && !scanning" autoplay class="scanner-box"></video>
        </div>
        <div class="col-3">
          <div v-if="profileImageContent">
            <img :src="profileImageContent" width="200px" class="mb-4">
          </div>
        </div>
      </b-col>

      <b-col sm="12">
        <hr>
        <b-button type="button" @click="initLogin()" variant="" :disabled="!canScanFace || !passportNo">وارد شدن</b-button>
        <b-button type="reset" variant="info" @click="goToMainPage()">بازگشت</b-button>
      </b-col>
    </b-row>
  </b-form>

</template>

<script>
import $ from "jquery";
import * as faceApi from "face-api.js";

export default {
  name: "login",

  auth: 'guest',

  data() {
    return {
      passportNo: null,
      scanned: false, // GETTING TRUE WHEN DOCUMENT SCANNED
      scanning: false, // GETTING TRUE WHEN DOCUMENT SCANNING FINISHED
      currentStream: null,
      currentDeviceID: null,
      cameraLoading: false,
      docApproved: true,
      profileImageContent: null, // WILL HOLD PROFILE PICTURE CONTENT
      faceCropBox: {},
      canScanFace: false,
    }
  },

  methods: {

    initScanner(){
      this.setVideoAttr();
      this.getCameraDevices(true);
    },

    goToMainPage(){
      this.stopCamera();
      window.location.href = '/'
    },

    // setting new attributes to video
    setVideoAttr(){
      // console.log(`1.SETTING VIDEO ATTRIBUTES`)
      $('#cameraDisplay')[0].setAttribute('autoplay', '');
      $('#cameraDisplay')[0].setAttribute('muted', '');
      $('#cameraDisplay')[0].setAttribute('playsinline', '');
    },

    // getting camera devices
    getCameraDevices(withFaceDetection){
      // console.log(`2.GETTING CAMERA DEVICES`)
      if ('mediaDevices' in navigator) {
        navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        }).then((stream) => {
          // initialize current stream
          this.currentStream = stream;
          // delete camera items from selector
          // console.log(`3.REMOVED DEVICES FROM SELECTOR`)
          $("#cameraList option").each(function() {
            $(this).remove();
          });

          const getCameraSelection = async () => {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            // append camera devices to selector
            // console.log(`4.APPENDING DEVICES TO SELECTOR`)
            const options = videoDevices.map(videoDevice => {
              $("#cameraList").append(`<option value="${videoDevice.deviceId}">${videoDevice.label}</option>`);
            });
            // stop camera
            this.stopCamera();
            // if no any camera detected alert an error about that
            if ($("#cameraList option").length === 0) {
              alert("Sorry, your device does not have a camera.");
            } else{
              // else start camera button must be disabled and camera started
              $('#btnStartCamera').prop("disabled", true);
              // then start camera
              this.startCamera(withFaceDetection);
            }
          };
          getCameraSelection();
        }).catch((error) => {
          alert("Failed to get camera list!");
        });
      } else {
        alert("Browser does not support mediaDevices API.");
      }
    },

    startCameraStream(deviceID, withFaceDetection) {
      if ('mediaDevices' in navigator && navigator.mediaDevices.getUserMedia) {
        if (this.cameraLoading === true) return;

        this.cameraLoading = true;
        // build a constraint
        let constraints = {
          video: {
            width: {ideal: 1920},
            height: {ideal: 1080},

            deviceId: {
              exact: deviceID
            }
          }
        };
        // stop current stream if there is one
        this.stopCamera();

        this.setVideoAttr();
        // delay the stream for a bit to prevent browser bugging out when switching camera
        const this_ = this;

        setTimeout(function () {
          navigator.mediaDevices.getUserMedia(constraints).then(async function (mediastream) {
            this_.currentStream = mediastream;
            // show the camera stream inside our video element
            $('#cameraDisplay')[0].srcObject = mediastream;
            this_.cameraLoading = false;
            $('#btnCapture').prop("disabled", false);

            if(withFaceDetection){

              setTimeout(function (){

                const video = $('#cameraDisplay')
                const canvas = faceApi.createCanvasFromMedia(video[0])
                $(canvas).addClass('faceDetectionContainerLeftZero');
                $("#scannerContainer").append(canvas);
                const displaySize = { width: video.width(), height: video.height() }
                faceApi.matchDimensions(canvas, displaySize)

                setInterval(async () => {
                  const detections = await faceApi.detectAllFaces(video[0], new faceApi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
                  let resizedDetections = faceApi.resizeResults(detections, displaySize)
                  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
                  faceApi.draw.drawDetections(canvas, resizedDetections)

                  if(
                    resizedDetections &&
                    resizedDetections.length &&
                    resizedDetections[0] &&
                    resizedDetections[0].detection &&
                    resizedDetections[0].detection._box
                  ){
                    this_.faceCropBox = resizedDetections[0].detection;
                    this_.canScanFace = true;
                  }else{
                    this_.faceCropBox = {};
                    this_.canScanFace = false;
                  }
                }, 100)
              }, 1000)
            }
          }).catch(function (err) {
            this_.cameraLoading = false;
            alert("Camera Error!");
          });
        }, 100);
      }
    },

    // starting camera
    startCamera(withFaceDetection) {
      // console.log(`6.STARTING CAMERA`)
      // get device id from selected item
      if(this.currentDeviceID === $("#cameraList").val()) return;
      this.currentDeviceID = $("#cameraList").val();
      // start camera stream with device id
      this.startCameraStream(this.currentDeviceID, withFaceDetection);
    },
    // stopping camera
    stopCamera() {
      // console.log(`5.STOPPING CAMERA`)
      if (typeof this.currentStream !== 'undefined' && this.currentStream !== false) {
        // Workaround Android 11 Chrome camera freeze when switching camera
        $('#cameraDisplay')[0].srcObject = null;
        this.currentStream.getTracks().forEach(track => {
          track.stop();
        });
        this.currentStream = false;
      }
    },
    // capturing image
    captureImage(){
      // console.log(`1.CAPTURING IMAGE`)
      // Copy the video frame to canvas
      const documentcanvas = document.getElementById('documentcanvas');
      documentcanvas.width = $('#cameraDisplay')[0].videoWidth;
      documentcanvas.height = $('#cameraDisplay')[0].videoHeight;

      let documentctx = documentcanvas.getContext('2d');

      let destinationWidth = documentcanvas.width;
      let destinationHeight = documentcanvas.height;

      if(this.docApproved){
        destinationWidth = this.faceCropBox._imageDims && this.faceCropBox._imageDims._width;
        destinationHeight = this.faceCropBox._imageDims && this.faceCropBox._imageDims._height;
      }

      documentctx.drawImage($('#cameraDisplay')[0],
        this.faceCropBox._box && this.faceCropBox._box._x || 0,
        this.faceCropBox._box && this.faceCropBox._box._y || 0,
        this.faceCropBox._imageDims && this.faceCropBox._imageDims._width || documentcanvas.width,
        this.faceCropBox._imageDims && this.faceCropBox._imageDims._height || documentcanvas.height,
        0, 0, destinationWidth , destinationHeight);

      // convert canvas content to base64 image
      let imageBase64 = documentcanvas.toDataURL("image/png");
      if(imageBase64){
        // console.log(`2.GOT IMAGE`)
      }

      if(!this.docApproved) {
        this.imageContent = imageBase64;
        // console.log(`3.DOC NOT APPROVED YET, SAVED AS DOCUMENT IMAGE`)
      }else{
        this.profileImageContent = imageBase64;
        // console.log(`3(1).DOC IS APPROVED, SAVED AS PROFILE IMAGE`)
      }

      // send the base64 content to Core API
      if(!this.docApproved) {
        this.CoreAPIScan(imageBase64);
      }
    },

    createImageUrl(event) {

      if (!event.target.files)
        return

      this.avatarImage = event.target.files[0]
      this.avatarImagePrev = URL.createObjectURL(this.avatarImage)
    },

    initLogin(){
      this.$auth.loginWith("local" , {
        data : {
          passportNo: this.passportNo,
        }
      }).then(() => {
        this.stopCamera();
      })
    },

    onReset(event) {
      event.preventDefault()

      this.form.username = ''
      this.form.password = ''
    },

    loginWithFB(){
      this.$auth.loginWith('facebook').then(({data}) => {
        this.$router.push('/')
      })
    }
  },


  mounted() {
    $nuxt.$emit('setPageTitle', {title: 'وارد شدن'})

    Promise.all([
      faceApi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceApi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceApi.nets.faceRecognitionNet.loadFromUri('/models'),
      faceApi.nets.faceExpressionNet.loadFromUri('/models')
    ]).then(() => {
      console.log(`DONE LOADING FACE MODELS`)
      this.initScanner()
    }).catch((err) => {
      console.log(err.message)
    })
  }
}
</script>

<style scoped>

</style>
