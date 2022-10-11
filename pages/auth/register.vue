<template>
  <b-row class="text-center">

    <b-col cols="12" v-if="!submitted">
      <b-form-group label="روش ثبت نام را انتخاب کنید" v-slot="{ ariaDescribedby }">
        <b-form-radio v-model="selected" :aria-describedby="ariaDescribedby" name="sign_up_value" value="id_card">کارت شناسایی</b-form-radio>
        <b-form-radio v-model="selected" :aria-describedby="ariaDescribedby" name="sign_up_value" value="passport">گذرنامه</b-form-radio>
      </b-form-group>


      
      <div class="text-center d-flex justify-content-center">
        <div v-if="selected && selected==='id_card'">
        <b-card
          title="دستورالعمل کارت شناسایی"
          img-src="https://docupass.app/asset/id-guide-front.jpg"
          img-alt="تصویر"
          img-top
          tag="article"
          style="max-width: 20rem;"
          class="mb-2"
        >
          <b-card-text>
            در مرحله بعد باید عکس سمت جلوی کارت شناسایی خود را آپلود کنید. برای جلوگیری از تابش خیره کننده و انعکاس باید عکس را با زاویه کمی بگیرید.
          </b-card-text>
        </b-card>
        </div>
        <div v-if="selected && selected==='passport'">
          <b-card
            title="دستورالعمل پاسپورت"
            img-src="https://thumbs.dreamstime.com/b/passport-map-boarding-pass-54361464.jpg"
            img-alt="Image"
            img-top
            tag="article"
            style="max-width: 20rem;"
            class="mb-2"
          >
            <b-card-text>
              اما خود دردها دلیلش را نمی دانند، رد شدنی هم هستند!
            </b-card-text>
          </b-card>
        </div>
      </div>
    </b-col>

    <b-col cols="12" v-if="submitted">
      <p>ارسال شده <span v-if="selected === 'id_card'">کارت شناسایی</span> <span v-if="selected === 'passport'">گذرنامه</span>
        <b-button size="sm" id="btnStartCamera" type="button" @click="initializeVideoStream()">دوربین را راه اندازی کنید</b-button> </p>

        <div class="row">
          <div class="offset-4 col-4">
            <div class="mb-5">
              <b-form-select id="cameraList" class="mb-4" @change="startCamera()"></b-form-select>

              <p v-if="scanning">
                در حال اسکن سند خود لطفا صبر کنید
                <b-icon icon="arrow-clockwise" animation="spin" font-scale="1"></b-icon>
              </p>

              <div v-if="profileImageContent">
                <img :src="profileImageContent" width="200px" class="mb-4">
                <b-button size="sm" type="button" @click="approveProfile()">تایید تصویر</b-button>
              </div>
            </div>
          </div>

          <!--SCANNED DOCUMENT INFO-->
          <div class="offset-4 col-4" v-if="scanned">
            <div class="mb-3" >
              <div >
                <b-card
                  title="Passport Data"
                  :img-src="imageContent"
                  img-alt="Scanned Document Result"
                  img-top
                  tag="article"
                  style="width: 100%;"
                  class="mb-2"
                >
                  <!--BODY OF SCANNED DOCUMENT-->
                  <b-card-text>
                    <p>لطفاً اطلاعات زیر را بررسی کنید و اگر همه چیز درست است تأیید کنید</p>
                    <p>
                      <b> نام و نام خانوادگی </b>
                      <b-form-input
                        id="username"
                        v-model="scannedDoc.fullName"
                        type="text"
                        placeholder="نام کاربری خود را وارد کنید"
                        required
                      ></b-form-input>
                    </p>
                    <p>
                      <b> ملی </b>
                      <b-form-input
                        id="username"
                        v-model="scannedDoc.nationalNo"
                        type="text"
                        required
                      ></b-form-input>
                    </p>

                    <p v-if="selected === 'passport'">
                      <b> سریال پاسپورت </b>
                      <b-form-input
                        id="username"
                        v-model="scannedDoc.passportSerial"
                        type="text"
                        required
                      ></b-form-input>
                    </p>
                    <p v-if="selected === 'id_card'">
                      <b> NFC </b>
                      <b-form-input
                        id="username"
                        v-model="scannedDoc.NFC"
                        type="text"
                        required
                      ></b-form-input>
                    </p>
                    <p v-if="selected === 'id_card'">
                      <b> ORC </b>
                      <b-form-input
                        id="username"
                        v-model="scannedDoc.ORC"
                        type="text"
                        required
                      ></b-form-input>
                    </p>
                  </b-card-text>
                  <!--BODY OF SCANNED DOCUMENT END-->

                  <!--ACTIONS WITH SCANNED DOCUMENT-->
                  <b-button href="#" variant="primary" @click="approveScannedDoc()">تایید</b-button>
                  <b-button href="#" variant="primary" @click="tryAgainDocScan()">دوباره امتحان کنید</b-button>
                  <!--ACTIONS WITH SCANNED DOCUMENT END-->
                </b-card>
              </div>
            </div>
          </div>
          <!--SCANNED DOCUMENT INFO END-->

          <!--SCAN ACTION CONTAINER-->
          <div class="offset-4 col-4" id="scannerContainer">
            <video id="cameraDisplay" v-show="!scanned && !scanning" autoplay class="scanner-box"></video>
            <b-button id="btnCapture" type="button" @click="captureImage()" disabled v-show="!docApproved && currentStream && !scanned && !scanning">
              ضبط و اسکن
            </b-button>
            <b-button id="btnCapture" type="button" @click="captureImage()" v-show="docApproved && canScanFace">
              اسکن چهره
            </b-button>
          </div>
          <!--SCAN ACTION CONTAINER END-->
        </div>

      <canvas id="documentcanvas" style="display: none"></canvas>
    </b-col>


    <!--MAIN BUTTONS OF NAVIGATION-->
    <b-col cols="12">
      <hr>
      <b-button v-if="!submitted" type="submit" variant="" @click="activateDocumentScanning()">ارسال</b-button>
      <b-button v-if="!submitted" type="reset" variant="info" to="/">بازگشت</b-button>
      <b-button v-if="submitted" type="reset" variant="info" @click="cancelDocumentScanning()">لغو کنید</b-button>
    </b-col>
    <!--MAIN BUTTONS OF NAVIGATION END-->
  </b-row>

</template>

<script>
import $ from "jquery";
import * as faceApi from 'face-api.js';

export default {
  name: "login",
  auth: 'guest',

  data() {
    return {
      luxandToken: "c891f727dbef42e29430b3ec3e6a9377",
      analyzerApiKey: 'VjbbsXfB1SfqHMaDtstWn7XbWbhgs6Y0',
      docApproved: false, // GETTING TRUE WHEN USER APPROVED HIS DOCUMENT SCAN
      scanned: false, // GETTING TRUE WHEN DOCUMENT SCANNED
      scanning: false, // GETTING TRUE WHEN DOCUMENT SCANNING FINISHED
      currentStream: null,
      currentDeviceID: null,
      cameraLoading: false,
      CoreAPIEndpoint: "https://api.idanalyzer.com",

      selected: '', // HOLDING SELECTED TYPER OF SCANNING
      imageContent: null, // WILL HOLD DOCUMENT CONTENT
      profileImageContent: null, // WILL HOLD PROFILE PICTURE CONTENT
      submitted: false,
      canScanFace: false,
      faceCropBox: {},

      scannedDoc:{
        NFC:null,
        ORC:null,
        passportSerial:null,
        fullName:null,
        nationalNo:null,
      }
    }
  },

  methods: {

    initializeVideoStream(withFaceDetection) {
      // lets drop variables to default values
      this.scanned = false;
      this.scanning = false;

      this.currentStream = null;
      this.currentDeviceID = null;
      this.cameraLoading = false;

      if(!this.docApproved) {
        this.imageContent = null;
      }
      this.profileImageContent = null;

      // WILL HOLD INFORMATION ABOUT SCANNED DOCUMENT
      if(!this.docApproved) {
        this.scannedDoc = {
          NFC: null,
          ORC: null,
          passportSerial: null,
          fullName: null,
          nationalNo: null,
        };
      }

      this.setVideoAttr();
      this.getCameraDevices(withFaceDetection);
    },

    approveProfile(){

      let form = new FormData()
      form.append('passportData', JSON.stringify(this.scannedDoc))
      form.append('scannedDoc', this.imageContent)
      form.append('profileImage', this.profileImageContent)

      this.$axios.post('/user/save', form).then(({data}) => {

          //emmit message to default layout
          this.$nuxt.$emit('setMessage', {type: data.status, message: data.status})

          // if everything is correct log in user
          if (data.saved) {

            console.log(`this.scannedDoc`)
            console.log(this.scannedDoc)

            this.$auth.loginWith('local', {
              data: {
                passportNo: this.scannedDoc && this.scannedDoc.passportSerial
                // username: this.form.username,
                // password: this.form.password
              }
            }).then(() => {
              this.stopCamera();
            })
          }
        })
    },

    cancelDocumentScanning(){
      this.submitted=!this.submitted;
      this.scanning = false;
      this.scanned = false;
      this.docApproved = false;
      this.currentStream = false;
    },

    approveScannedDoc(){
      this.scanning = false;
      this.scanned = false;
      this.docApproved = true;
      this.initializeVideoStream(true);
    },

    // setting new attributes to video
    setVideoAttr(){
      // console.log(`1.SETTING VIDEO ATTRIBUTES`)
      $('#cameraDisplay')[0].setAttribute('autoplay', '');
      $('#cameraDisplay')[0].setAttribute('muted', '');
      $('#cameraDisplay')[0].setAttribute('playsinline', '');
    },

    // try again with page reloading
    tryAgainDocScan() {
      this.initializeVideoStream()
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

    // starting camera
    startCamera(withFaceDetection) {
      // console.log(`6.STARTING CAMERA`)
      // get device id from selected item
      if(this.currentDeviceID === $("#cameraList").val()) return;
      this.currentDeviceID = $("#cameraList").val();
      // start camera stream with device id
      this.startCameraStream(this.currentDeviceID, withFaceDetection);
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

    CoreAPIScan(imageContent) {
      const this_ = this;
      this.scanning = true;

      // generate an unique ID to identify the current request
      let scanID = "scan" + Date.now();

      // Add a new row into our result table and assign our unique ID to a cell so we can change its content when we receive AJAX result
      // $("#result").append(`<tr><td><img src="${imageContent}" style="max-width: 300px"></td><td id="${scanID}">Scanning...</td></tr>`)

      // build a request JSON, you can add your own parameters by checking out Core API Reference
      let requestJSON = {
        apikey: this.analyzerApiKey,
        file_base64: imageContent
      }
      let requestString = JSON.stringify(requestJSON);

      // upload document image to ID Analyzer Core API
      $.ajax({
        url: this.CoreAPIEndpoint,
        data: requestString,
        type: "POST",
        contentType: "application/json",
        timeout: 30000,
        success: function (output) {
          // convert html entities to code
          let jsonResult = JSON.stringify(output, null, 2);
          // display result in the table cell
          jsonResult = JSON.parse(jsonResult);
          this_.scanning = false;
          this_.scanned = true;

          this_.scannedDoc.fullName = `${jsonResult.result && jsonResult.result.firstName || '-'} ${jsonResult.result && jsonResult.result.lastName || '-'}`
          this_.scannedDoc.passportSerial = `${jsonResult.result && jsonResult.result.documentNumber || '-'}`
          this_.scannedDoc.nationalNo = `${jsonResult.result && jsonResult.result.nationality_iso3 || '-'}`
        },
      });
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
                $(canvas).addClass('faceDetectionContainer');
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

    activateDocumentScanning(){
      this.imageContent = null;
      this.submitted = true;
    },
  },

  mounted() {
    $nuxt.$emit('setPageTitle', {title: 'ثبت نام'});
    // console.log(`faceApi.nets`)
    // console.log(faceApi.nets)

    Promise.all([
      faceApi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceApi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceApi.nets.faceRecognitionNet.loadFromUri('/models'),
      faceApi.nets.faceExpressionNet.loadFromUri('/models')
    ]).then(() => {
      console.log(`DONE LOADING FACE MODELS`)
    }).catch((err) => {
      console.log(err.message)
    })
  }
}
</script>

<style scoped>

</style>
