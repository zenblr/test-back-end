import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef, ChangeDetectionStrategy, ViewChild, Inject, ElementRef } from '@angular/core';
import { UserAddressService, UserBankService, UserPersonalService, UserDetailsService } from '../../../../../../core/kyc-settings';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SharedService } from '../../../../../../core/shared/services/shared.service';
import { map, filter, finalize, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { AppliedKycService } from '../../../../../../core/applied-kyc/services/applied-kyc.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { WebcamDialogComponent } from '../../webcam-dialog/webcam-dialog.component';
import { ImagePreviewDialogComponent } from '../../../../../partials/components/image-preview-dialog/image-preview-dialog.component';

@Component({
  selector: 'kt-user-review',
  templateUrl: './user-review.component.html',
  styleUrls: ['./user-review.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserReviewComponent implements OnInit {

  @Output() next: EventEmitter<any> = new EventEmitter<any>();
  identityProofs = [];
  addressProofs = [];
  customerKycBank: FormGroup
  customerKycPersonal: FormGroup
  reviewForm: FormGroup;
  customerKycAddressOne: FormGroup
  customerKycAddressTwo: FormGroup
  states = [];
  cities0 = [];
  cities1 = [];
  maxDate = new Date();
  @ViewChild("identity", { static: false }) identity;
  @ViewChild("permanent", { static: false }) permanent;
  @ViewChild("residential", { static: false }) residential;
  @ViewChild("pass", { static: false }) pass;


  // data = {
  //   "customerKycReview": {
  //     "id": 1,
  //     "customerUniqueId": null,
  //     "firstName": "bhushan",
  //     "lastName": "madaye",
  //     "mobileNumber": "8424004296",
  //     "email": "nimap@infotech.com",
  //     "panCardNumber": "asass1234a",
  //     "stageId": 1,
  //     "statusId": 1,
  //     "stateId": 1,
  //     "cityId": 1,
  //     "kycStatus": "pending",
  //     "isKycSubmitted": false,
  //     "isVerifiedByCce": false,
  //     "cceVerifiedBy": null,
  //     "isVerifiedByBranchManager": false,
  //     "branchManagerVerifiedBy": null,
  //     "isActive": true,
  //     "createdBy": 36,
  //     "modifiedBy": 36,
  //     "lastLogin": null,
  //     "createdAt": "2020-04-28T05:31:32.245Z",
  //     "updatedAt": "2020-04-28T05:31:32.245Z",
  //     "customerKycPersonal": {
  //       "id": 1,
  //       "customerId": 1,
  //       "profileImage": "http://173.249.49.7:8000/uploads/images/1588052119361.png",
  //       "firstName": "bhushan",
  //       "lastName": "madaye",
  //       "dateOfBirth": "2020-04-08T18:30:00.000Z",
  //       "age": "25",
  //       "alternateMobileNumber": "1232132132",
  //       "panCardNumber": "asass1234a",
  //       "gender": "f",
  //       "martialStatus": "married",
  //       "occupation": { id: 1, name: 'Business' }, // occupation.name
  //       "identityType": { id: 1, name: "passport" },  //identityType.name
  //       "identityProof": [
  //         "http://173.249.49.7:8000/uploads/images/1588052173393.png", "http://173.249.49.7:8000/uploads/images/1588052018310.png"
  //       ],
  //       "identityProofNumber": "asd432asd",
  //       "spouseName": "asd",
  //       "signatureProof": "http://173.249.49.7:8000/uploads/images/1588052173393.png",
  //       "createdBy": 36,
  //       "modifiedBy": 36,
  //       "isActive": false,
  //       "createdAt": "2020-04-28T05:33:23.145Z",
  //       "updatedAt": "2020-04-28T05:36:22.176Z"
  //     },
  //     "customerKycAddress": [
  //       {
  //         "id": 1,
  //         "customerKycId": 1,
  //         "customerId": 1,
  //         "addressType": "permanent",
  //         "address": "assa1212",
  //         "state": { id: 1, name: "Andaman and Nicobar Islands" }, // state.name
  //         "city": { id: 3, name: "Port Blair" }, // city.name
  //         "pinCode": 122121,
  //         "addressProof": [
  //           "http://173.249.49.7:8000/uploads/images/1588052060956.png",
  //           "http://173.249.49.7:8000/uploads/images/1588052086540.png"
  //         ],
  //         "createdAt": "2020-04-28T05:35:06.709Z",
  //         "updatedAt": "2020-04-28T05:35:06.709Z",
  //         "addressProofType": { id: 4, name: "voter Id" }, // addressProofType.name
  //         "addressProofNumber": "qwewq123"
  //       },
  //       {
  //         "id": 2,
  //         "customerKycId": 1,
  //         "customerId": 1,
  //         "addressType": "residential",
  //         "address": "assa1212",
  //         "state": { id: 5, name: "Bihar" },
  //         "city": { id: 454, name: "Bagaha" },
  //         "pinCode": 232323,
  //         "addressProof": [
  //           "http://173.249.49.7:8000/uploads/images/1588052060956.png", "http://173.249.49.7:8000/uploads/images/1588052018310.png"
  //         ],
  //         "createdAt": "2020-04-28T05:35:06.709Z",
  //         "updatedAt": "2020-04-28T05:35:06.709Z",
  //         "addressProofType": { id: 6, name: "aadhar card" },
  //         "addressProofNumber": "qwewq123"
  //       }
  //     ],
  //     "customerKycBank": [
  //       {
  //         "id": 4,
  //         "customerKycId": 1,
  //         "customerId": 1,
  //         "bankName": "nkgsb",
  //         "bankBranchName": "virar",
  //         "accountType": "saving",
  //         "accountHolderName": "bhushan",
  //         "accountNumber": "123467126876872137",
  //         "ifscCode": "bkid1233123",
  //         "passbookProof": [
  //           "http://173.249.49.7:8000/uploads/images/1588052315608.png", "http://173.249.49.7:8000/uploads/images/1588052018310.png"
  //         ],
  //         "createdAt": "2020-04-28T05:44:52.576Z",
  //         "updatedAt": "2020-04-28T05:44:52.576Z"
  //       }
  //     ]
  //   },
  //   "customerId": 1,
  //   "customerKycId": 1
  // }

  // data = {
  //   "customerId": 1,
  //   "customerKycId": 1,
  //   "customerKycCurrentStage": "4",
  //   "customerKycReview": {
  //     "id": 1,
  //     "firstName": "bhushan",
  //     "lastName": "madaye",
  //     "panCardNumber": "ASDAS1234A",
  //     "mobileNumber": "8424004296",
  //     "panType": "pan",
  //     "panImage": "http://78fd98a3462d.ngrok.io//uploads/images/1593169195056.png",
  //     "customerKycPersonal": {
  //       "id": 1,
  //       "customerId": 1,
  //       "firstName": "bhushan",
  //       "lastName": "madaye",
  //       "profileImage": 1497,
  //       "dateOfBirth": "1997-01-04T18:30:00.000Z",
  //       "alternateMobileNumber": "9834832743",
  //       "panCardNumber": "ASDAS1234A",
  //       "gender": "m",
  //       "age": "23",
  //       "martialStatus": "divorced",
  //       "occupationId": 3,
  //       "identityTypeId": 2,
  //       "identityProofNumber": "voter123",
  //       "spouseName": "kane",
  //       "signatureProof": 1498,
  //       "occupation": {
  //         "id": 3,
  //         "name": "Employee",
  //         "isActive": true,
  //         "createdAt": "2020-05-04T13:51:06.606Z",
  //         "updatedAt": "2020-05-04T13:51:06.606Z"
  //       },
  //       "identityType": {
  //         "id": 2,
  //         "name": "Voter ID",
  //         "isActive": true,
  //         "createdAt": "2020-05-04T13:49:55.636Z",
  //         "updatedAt": "2020-05-04T13:49:55.636Z"
  //       },
  //       "profileImageData": {
  //         "id": 1497,
  //         "filename": "1593176955515.jpeg",
  //         "mimetype": "image/jpeg",
  //         "encoding": "7Bit",
  //         "originalname": null,
  //         "userId": 1,
  //         "url": "public/uploads/images/1593176955515",
  //         "createdAt": "2020-06-26T13:09:15.516Z",
  //         "updatedAt": "2020-06-26T13:09:15.516Z",
  //         "URL": "http://78fd98a3462d.ngrok.io/uploads/images/1593176955515"
  //       },
  //       "signatureProofData": {
  //         "id": 1498,
  //         "filename": "1593176979300.png",
  //         "mimetype": "image/png",
  //         "encoding": "7bit",
  //         "originalname": "Artboard – 1 (1).png",
  //         "userId": 1,
  //         "url": "public/uploads/images/1593176979300.png",
  //         "createdAt": "2020-06-26T13:09:43.255Z",
  //         "updatedAt": "2020-06-26T13:09:43.255Z",
  //         "URL": "http://78fd98a3462d.ngrok.io/uploads/images/1593176979300.png"
  //       },
  //       "identityProofImage": [
  //         {
  //           "id": 1,
  //           "customerKycPersonalDetai": 1,
  //           "identityProofId": 1491,
  //           "createdAt": "2020-06-26T13:08:56.616Z",
  //           "updatedAt": "2020-06-26T13:08:56.616Z",
  //           "identityProof": {
  //             "id": 1491,
  //             "filename": "1593176792329.png",
  //             "mimetype": "image/png",
  //             "encoding": "7bit",
  //             "originalna": "Artboard – 5.png",
  //             "userId": 1,
  //             "url": "public/uploads/images/1593176792329.png",
  //             "createdAt": "2020-06-26T13:06:34.247Z",
  //             "updatedAt": "2020-06-26T13:06:34.247Z",
  //             "URL": "http://78fd98a3462d.ngrok.io/uploads/images/1593176792329.png"
  //           }
  //         },
  //         {
  //           "id": 2,
  //           "customerKycPersonalDetai": 1,
  //           "identityProofId": 1492,
  //           "createdAt": "2020-06-26T13:08:56.616Z",
  //           "updatedAt": "2020-06-26T13:08:56.616Z",
  //           "identityProof": {
  //             "id": 1492,
  //             "filename": "1593176799486.png",
  //             "mimetype": "image/png",
  //             "encoding": "7bit",
  //             "originalna": "Artboard – 6.png",
  //             "userId": 1,
  //             "url": "public/uploads/images/1593176799486.png",
  //             "createdAt": "2020-06-26T13:06:40.365Z",
  //             "updatedAt": "2020-06-26T13:06:40.365Z",
  //             "URL": "http://78fd98a3462d.ngrok.io/uploads/images/1593176799486.png"
  //           }
  //         }
  //       ]
  //     },
  //     "customerKycAddress": [
  //       {
  //         "id": 1,
  //         "customerKycId": 1,
  //         "customerId": 1,
  //         "addressType": "permanent",
  //         "address": "add 1",
  //         "stateId": 22,
  //         "cityId": 2726,
  //         "pinCode": 500000,
  //         "addressProofTypeId": 3,
  //         "addressProofNumber": "driv2345",
  //         "state": {
  //           "id": 22,
  //           "name": "Maharashtra",
  //           "isActive": true
  //         },
  //         "city": {
  //           "id": 2726,
  //           "name": "Navi Mumbai",
  //           "stateId": 22,
  //           "slug": null,
  //           "isActive": true
  //         },
  //         "addressProofType": {
  //           "id": 3,
  //           "name": "Driving license",
  //           "isActive": true,
  //           "createdAt": "2020-05-04T13:48:00.807Z",
  //           "updatedAt": "2020-05-04T13:48:00.807Z"
  //         },
  //         "addressProofImage": [
  //           {
  //             "id": 1,
  //             "customerKycAddressDetailId": 1,
  //             "addressProofId": 1493,
  //             "createdAt": "2020-06-26T13:08:56.646Z",
  //             "updatedAt": "2020-06-26T13:08:56.646Z",
  //             "addressProof": {
  //               "id": 1493,
  //               "filename": "1593176881680.png",
  //               "mimetype": "image/png",
  //               "encoding": "7bit",
  //               "originalname": "Artboard – 7.png",
  //               "userId": 1,
  //               "url": "public/uploads/images/1593176881680.png",
  //               "createdAt": "2020-06-26T13:08:01.926Z",
  //               "updatedAt": "2020-06-26T13:08:01.926Z",
  //               "URL": "http://78fd98a3462d.ngrok.io/uploads/images/1593176881680.png"
  //             }
  //           },
  //           {
  //             "id": 2,
  //             "customerKycAddressDetailId": 1,
  //             "addressProofId": 1494,
  //             "createdAt": "2020-06-26T13:08:56.646Z",
  //             "updatedAt": "2020-06-26T13:08:56.646Z",
  //             "addressProof": {
  //               "id": 1494,
  //               "filename": "1593176887753.png",
  //               "mimetype": "image/png",
  //               "encoding": "7bit",
  //               "originalname": "Artboard – 2.png",
  //               "userId": 1,
  //               "url": "public/uploads/images/1593176887753.png",
  //               "createdAt": "2020-06-26T13:08:13.105Z",
  //               "updatedAt": "2020-06-26T13:08:13.105Z",
  //               "URL": "http://78fd98a3462d.ngrok.io/uploads/images/1593176887753.png"
  //             }
  //           }
  //         ]
  //       },
  //       {
  //         "id": 2,
  //         "customerKycId": 1,
  //         "customerId": 1,
  //         "addressType": "residential",
  //         "address": "add 2",
  //         "stateId": 1,
  //         "cityId": 1,
  //         "pinCode": 900000,
  //         "addressProofTypeId": 5,
  //         "addressProofNumber": "bak4567",
  //         "state": {
  //           "id": 1,
  //           "name": "Andaman and Nicobar Islands",
  //           "isActive": true
  //         },
  //         "city": {
  //           "id": 1,
  //           "name": "Bombuflat",
  //           "stateId": 1,
  //           "slug": null,
  //           "isActive": true
  //         },
  //         "addressProofType": {
  //           "id": 5,
  //           "name": "Bank passbook",
  //           "isActive": true,
  //           "createdAt": "2020-05-18T11:41:50.724Z",
  //           "updatedAt": "2020-05-18T11:41:50.724Z"
  //         },
  //         "addressProofImage": [
  //           {
  //             "id": 3,
  //             "customerKycAddressDetailId": 2,
  //             "addressProofId": 1495,
  //             "createdAt": "2020-06-26T13:08:56.658Z",
  //             "updatedAt": "2020-06-26T13:08:56.658Z",
  //             "addressProof": {
  //               "id": 1495,
  //               "filename": "1593176921512.png",
  //               "mimetype": "image/png",
  //               "encoding": "7bit",
  //               "originalname": "Artboard – 3.png",
  //               "userId": 1,
  //               "url": "public/uploads/images/1593176921512.png",
  //               "createdAt": "2020-06-26T13:08:44.097Z",
  //               "updatedAt": "2020-06-26T13:08:44.097Z",
  //               "URL": "http://78fd98a3462d.ngrok.io/uploads/images/1593176921512.png"
  //             }
  //           },
  //           {
  //             "id": 4,
  //             "customerKycAddressDetailId": 2,
  //             "addressProofId": 1496,
  //             "createdAt": "2020-06-26T13:08:56.658Z",
  //             "updatedAt": "2020-06-26T13:08:56.658Z",
  //             "addressProof": {
  //               "id": 1496,
  //               "filename": "1593176930526.png",
  //               "mimetype": "image/png",
  //               "encoding": "7bit",
  //               "originalname": "Artboard – 4.png",
  //               "userId": 1,
  //               "url": "public/uploads/images/1593176930526.png",
  //               "createdAt": "2020-06-26T13:08:52.775Z",
  //               "updatedAt": "2020-06-26T13:08:52.775Z",
  //               "URL": "http://78fd98a3462d.ngrok.io/uploads/images/1593176930526.png"
  //             }
  //           }
  //         ]
  //       }
  //     ]
  //   }
  // }

  file: any;
  occupations = [];

  data: any = {};
  viewOnly = true;
  userType: any;
  identityImageArray = [];
  addressImageArray1 = [];
  addressImageArray2 = [];
  identityIdArray = [];
  addressIdArray1 = [];
  addressIdArray2 = [];
  identityFileNameArray = [];
  addressFileNameArray1 = [];
  addressFileNameArray2 = [];


  constructor(private userAddressService:
    UserAddressService, private fb: FormBuilder,
    private sharedService: SharedService,
    private ref: ChangeDetectorRef,
    private userBankService: UserBankService,
    private userDetailsService: UserDetailsService,
    private toastr: ToastrService,
    private userPersonalService: UserPersonalService,
    private appliedKycService: AppliedKycService,
    public dialogRef: MatDialogRef<UserReviewComponent>,
    @Inject(MAT_DIALOG_DATA) public modalData: any,
    private dialog: MatDialog,
    private ele: ElementRef
  ) {
    let res = this.sharedService.getDataFromStorage();
    this.userType = res.userDetails.userTypeId;

    if (this.modalData.action) {
     
      this.viewOnly = false;
    }
  }

  ngOnInit() {
    if (this.userPersonalService.kycDetails) {
      this.data = this.userPersonalService.kycDetails;
    } else
      if (this.userDetailsService.userData) {
        this.data = this.userDetailsService.userData;
      }

    this.appliedKycService.userData$.subscribe(res => {
      if (res) {
        this.data = res;
      }
    })


    this.initForm();

    this.getStates();
    this.getIdentityType();
    this.getAddressProofType();
    this.getOccupation();

    let identityArray = this.data.customerKycReview.customerKycPersonal
    this.identityImageArray = identityArray.identityProofImage
    this.identityIdArray = identityArray.identityProof
    this.reviewForm.controls.identityProof.patchValue(this.identityIdArray);
    this.customerKycPersonal.controls.identityProof.patchValue(this.identityIdArray);


    let addressArray1 = this.data.customerKycReview.customerKycAddress[0]
    this.addressImageArray1 = addressArray1.addressProofImage
    this.addressIdArray1 = addressArray1.addressProof
    this.customerKycAddressOne.controls.addressProof.patchValue(this.addressIdArray1);


    let addressArray2 = this.data.customerKycReview.customerKycAddress[1]
    this.addressImageArray2 = addressArray2.addressProofImage
    this.addressIdArray2 = addressArray2.addressProof
    this.customerKycAddressTwo.controls.addressProof.patchValue(this.addressIdArray2);



    if (!this.viewOnly || this.userType == 5) {
      this.reviewForm.disable();
      this.customerKycPersonal.disable();
      this.customerKycAddressOne.disable();
      this.customerKycAddressTwo.disable();

    }

  }

  initForm() {
    this.reviewForm = this.fb.group({
      profileImage: [this.data.customerKycReview.customerKycPersonal.profileImage, [Validators.required]],
      firstName: [this.data.customerKycReview.firstName, [Validators.required]],
      lastName: [this.data.customerKycReview.lastName, [Validators.required]],
      mobileNumber: [this.data.customerKycReview.mobileNumber, [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      panCardNumber: [this.data.customerKycReview.panCardNumber, [Validators.required, Validators.pattern('^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$')]],
      identityTypeId: [this.data.customerKycReview.customerKycPersonal.identityType.id, [Validators.required]],
      identityProof: [, [Validators.required]],
      identityProofFileName: [],
      identityProofNumber: [this.data.customerKycReview.customerKycPersonal.identityProofNumber, [Validators.required, Validators.pattern('[0-9]{12}')]],
    })
    this.customerKycAddressOne = this.fb.group({
      id: this.data.customerKycReview.customerKycAddress[0].id,
      customerKycId: this.data.customerKycReview.customerKycAddress[0].customerKycId,
      customerId: this.data.customerKycReview.customerKycAddress[0].customerId,
      addressType: [this.data.customerKycReview.customerKycAddress[0].addressType, [Validators.required]],
      address: [this.data.customerKycReview.customerKycAddress[0].address, [Validators.required]],
      stateId: [this.data.customerKycReview.customerKycAddress[0].state.id, [Validators.required]],
      cityId: [this.data.customerKycReview.customerKycAddress[0].city.id, [Validators.required]],
      pinCode: [this.data.customerKycReview.customerKycAddress[0].pinCode, [Validators.required, Validators.pattern('[1-9][0-9]{5}')]],
      addressProof: [, [Validators.required]],
      addressProofFileName: [],
      addressProofTypeId: [this.data.customerKycReview.customerKycAddress[0].addressProofType.id, [Validators.required]],
      addressProofNumber: [this.data.customerKycReview.customerKycAddress[0].addressProofNumber, [Validators.required]],

    })
    this.customerKycAddressTwo = this.fb.group({
      id: this.data.customerKycReview.customerKycAddress[1].id,
      customerKycId: this.data.customerKycReview.customerKycAddress[1].customerKycId,
      customerId: this.data.customerKycReview.customerKycAddress[1].customerId,
      addressType: [this.data.customerKycReview.customerKycAddress[1].addressType, [Validators.required]],
      address: [this.data.customerKycReview.customerKycAddress[1].address, [Validators.required]],
      stateId: [this.data.customerKycReview.customerKycAddress[1].state.id, [Validators.required]],
      cityId: [this.data.customerKycReview.customerKycAddress[1].city.id, [Validators.required]],
      pinCode: [this.data.customerKycReview.customerKycAddress[1].pinCode, [Validators.required, Validators.pattern('[1-9][0-9]{5}')]],
      addressProof: [, [Validators.required]],
      addressProofFileName: [],
      addressProofTypeId: [this.data.customerKycReview.customerKycAddress[1].addressProofType.id, [Validators.required]],
      addressProofNumber: [this.data.customerKycReview.customerKycAddress[1].addressProofNumber, [Validators.required]],
    })
    this.customerKycPersonal = this.fb.group({
      profileImage: [this.data.customerKycReview.customerKycPersonal.profileImage, [Validators.required]],
      alternateMobileNumber: [this.data.customerKycReview.customerKycPersonal.alternateMobileNumber, [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      gender: [this.data.customerKycReview.customerKycPersonal.gender, [Validators.required]],
      spouseName: [this.data.customerKycReview.customerKycPersonal.spouseName, [Validators.required]],
      martialStatus: [this.data.customerKycReview.customerKycPersonal.martialStatus, [Validators.required]],
      signatureProof: [],
      signatureProofFileName: [],
      occupationId: [],
      dateOfBirth: [this.data.customerKycReview.customerKycPersonal.dateOfBirth, [Validators.required]],
      age: [this.data.customerKycReview.customerKycPersonal.age, [Validators.required]],
      identityTypeId: [this.data.customerKycReview.customerKycPersonal.identityType.id, [Validators.required]],
      identityProof: [, [Validators.required]],
      identityProofNumber: [this.data.customerKycReview.customerKycPersonal.identityProofNumber, [Validators.required]],

    })
    if (this.data.customerKycReview.customerKycPersonal.occupation !== null) {
      this.customerKycPersonal.get('occupationId').patchValue(this.data.customerKycReview.customerKycPersonal.occupation.id)
    }
    if (this.data.customerKycReview.customerKycPersonal.signatureProofData !== null) {
      this.customerKycPersonal.controls.signatureProof.patchValue(this.data.customerKycReview.customerKycPersonal.signatureProof)

    }

    this.ref.detectChanges()
  }

  public calculateAge(dateOfBirth: any) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    this.customerKycPersonal.controls.age.patchValue(age)
  }

  ageValidation() {
    if (this.customerKycPersonal.controls.gender.value) {
      if (this.customerKycPersonal.controls.gender.value == 'm') {
        this.customerKycPersonal.controls.age.setValidators(Validators.pattern('^0*(2[1-9]|[3-9][0-9]|100)$'))
      } else {
        this.customerKycPersonal.controls.age.setValidators(Validators.pattern('^0*(1[89]|[2-9][0-9]|100)$'))
      }
      this.customerKycPersonal.controls.age.markAsTouched()
      this.calculateAge(this.customerKycPersonal.controls.dateOfBirth.value)
    }
  }

  submit() {

    this.customerKycPersonal.patchValue({
      identityTypeId: this.reviewForm.get('identityTypeId').value,
      identityProofNumber: this.reviewForm.get('identityProofNumber').value,
    })

    let customerKycAddress = [];
    customerKycAddress.push(this.customerKycAddressOne.value, this.customerKycAddressTwo.value);

    const data = {
      customerId: this.data.customerId,
      customerKycId: this.data.customerKycId,
      customerKycPersonal: this.customerKycPersonal.value,
      customerKycAddress: customerKycAddress,
    }

    if (this.customerKycPersonal.invalid || this.customerKycAddressOne.invalid || this.customerKycAddressTwo.invalid) {
      this.customerKycPersonal.markAllAsTouched();
      this.customerKycAddressOne.markAllAsTouched();
      this.customerKycAddressTwo.markAllAsTouched();
      // this.customerKycBank.markAllAsTouched();
      return;
    }

    // this.customerKycAddressOne.enable()
    // this.customerKycAddressTwo.enable()
    // 
    this.userBankService.kycSubmit(data).pipe(
      map(res => {
        this.next.emit(true);
      }),catchError(err => {
        if (err.error.message)
        this.toastr.error(err.error.message);
        throw (err)
      })
    ).subscribe()

  }

  getIdentityType() {
    this.userAddressService.getIdentityType().subscribe(res => {
      this.identityProofs = res.data.filter(filter => filter.name == 'Aadhaar Card');
      this.ref.detectChanges()
    })
  }

  getAddressProofType() {
    this.userAddressService.getAddressProofType().subscribe(res => {
      this.addressProofs = res.data;
      this.ref.detectChanges()
    })
  }

  getStates() {
    this.sharedService.getStates().subscribe(res => {
      this.states = res.data;
    });
    this.getCities('permanent');
    this.getCities('residential');
  }

  getCities(type?) {
    let stateId = null;
    if (type == 'permanent') {
      stateId = this.customerKycAddressOne.controls.stateId.value;
    } else if (type == 'residential') {
      stateId = this.customerKycAddressTwo.controls.stateId.value;
    }
    this.sharedService.getCities(stateId).subscribe(res => {
      if (type == 'permanent') {
        this.cities0 = res.data;
        this.ref.detectChanges();

      } else if (type == 'residential') {
        this.cities1 = res.data;
        this.ref.detectChanges();

      }
    });
  }

  getOccupation() {
    this.userPersonalService.getOccupation().subscribe(res => {
      this.occupations = res.data;
      this.ref.detectChanges();
    })
  }

  removeImages(index, type) {
  
    if (this.userType == 5) {
      return;
    }
    if (type == 'identityProof') {
      this.identityImageArray.splice(index, 1)
      this.identityIdArray.splice(index, 1)
      this.identityFileNameArray.splice(index, 1)
      this.reviewForm.patchValue({ identityProof: this.identityIdArray });
      this.reviewForm.patchValue({ identityProofFileName: this.identityFileNameArray });
    } else if (type == 'residential') {
      this.addressImageArray2.splice(index, 1)
      this.addressIdArray2.splice(index, 1)
      this.addressFileNameArray2.splice(index, 1)
      this.customerKycAddressTwo.patchValue({ addressProof: this.addressIdArray2 });
      this.customerKycAddressTwo.patchValue({ addressProofFileName: this.addressFileNameArray2 });

    } else if (type == 'permanent') {
      this.addressImageArray1.splice(index, 1)
      this.addressIdArray1.splice(index, 1)
      this.addressFileNameArray1.splice(index, 1)
      this.customerKycAddressOne.patchValue({ addressProof: this.addressIdArray1 });
      this.customerKycAddressOne.patchValue({ addressProofFileName: this.addressFileNameArray1 });
    }
    else if (type == 'signature') {
      this.data.customerKycReview.customerKycPersonal.signatureProofImg = ''
      this.data.customerKycReview.customerKycPersonal.signatureProof = null
      this.customerKycPersonal.patchValue({
        signatureProof: this.data.customerKycReview.customerKycPersonal.signatureProof,
        signatureProofFileName: ''
      });
    }
    // else if (type == 'passbook') {
    // this.data.customerKycReview.customerKycBank[0].passbookProof.splice(index, 1)
    // this.customerKycBank.patchValue({ passbookProofFileName: '' });
    // }
  }

  getFileInfo(event, type: any) {
    if (this.userType == 5) {
      return;
    }
    this.file = event.target.files[0];
    var name = event.target.files[0].name
    
    var ext = name.split('.')
    if (ext[ext.length - 1] == 'jpg' || ext[ext.length - 1] == 'png' || ext[ext.length - 1] == 'jpeg') {
      const params = {
        reason: 'customer',
        customerId: this.customerKycAddressOne.controls.customerId.value
      }
      this.sharedService.uploadFile(this.file, params).pipe(
        map(res => {

          if (type == "identityProof" && this.identityImageArray.length < 2) {
            this.identityImageArray.push(res.uploadFile.URL)
            this.identityIdArray.push(res.uploadFile.path)
            this.identityFileNameArray.push(event.target.files[0].name)
           
            this.customerKycPersonal.patchValue({ identityProof: this.identityIdArray })
            this.reviewForm.patchValue({ identityProofFileName: this.identityFileNameArray[this.identityFileNameArray.length - 1] });
          } else
            if (type == 'permanent' && this.addressImageArray1.length < 2) {
              this.addressImageArray1.push(res.uploadFile.URL)
              this.addressIdArray1.push(res.uploadFile.path)
              this.addressFileNameArray1.push(event.target.files[0].name)
              this.customerKycAddressOne.patchValue({ addressProof: this.addressIdArray1 })
              this.customerKycAddressOne.patchValue({ addressProofFileName: this.addressFileNameArray1[this.addressFileNameArray1.length - 1] });
            } else
              if (type == 'residential' && this.addressImageArray2.length < 2) {
                this.addressImageArray2.push(res.uploadFile.URL)
                this.addressIdArray2.push(res.uploadFile.path)
                this.addressFileNameArray2.push(event.target.files[0].name)
                this.customerKycAddressTwo.patchValue({ addressProof: this.addressIdArray2 })
                this.customerKycAddressTwo.patchValue({ addressProofFileName: this.addressFileNameArray2[this.addressFileNameArray2.length - 1] });
              } else
                if (type == "signature") {
                  this.data.customerKycReview.customerKycPersonal.signatureProofImg = res.uploadFile.URL;
                  this.customerKycPersonal.patchValue({ signatureProof: res.uploadFile.path })
                  this.customerKycPersonal.patchValue({ signatureProofFileName: event.target.files[0].name });
                  this.ref.markForCheck();
                }
                else if (type == "profile") {
                  this.data.customerKycReview.customerKycPersonal.profileImg = res.uploadFile.URL;
                  this.customerKycPersonal.patchValue({ profileImage: res.uploadFile.path })
                  this.ref.markForCheck();
                }
                else {
                  this.toastr.error("Cannot upload more than two images")
                }


          this.ref.detectChanges();
        }), catchError(err => {
          this.toastr.error(err.error.message);
          throw err
        }),
        finalize(() => {
          this.identity.nativeElement.value = '';
          this.permanent.nativeElement.value = '';
          this.residential.nativeElement.value = '';
          this.pass.nativeElement.value = '';
        })
      ).subscribe()
    } else {
      this.toastr.error('Upload Valid File Format');
    }

  }

  get controls() {
    return this.reviewForm.controls;
  }

  action() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.appliedKycService.userData.next(undefined)
  }

  webcam() {
    const dialogRef = this.dialog.open(WebcamDialogComponent,
      {
        data: {},
        width: '500px'
      });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        const params = {
          reason: 'customer',
          customerId: this.customerKycAddressOne.controls.customerId.value
        }
        this.sharedService.uploadBase64File(res.imageAsDataUrl, params).subscribe(res => {
          
          this.data.customerKycReview.customerKycPersonal.profileImg = res.uploadFile.URL
          this.customerKycPersonal.get('profileImage').patchValue(res.uploadFile.path);
          this.ref.detectChanges()
        })
      }
    });
  }

  previewImage(value) {
    // let concatArray = [];
    // concatArray
    // .push(this.data.customerKycReview.customerKycPersonal.profileImage, 
    //   this.data.customerKycReview.customerKycPersonal.signatureProof)
    // const temp = concatArray
    // .concat(this.data.customerKycReview.customerKycPersonal.identityProof,
    //   this.data.customerKycReview.customerKycAddress[0].addressProof,
    //   this.data.customerKycReview.customerKycAddress[1].addressProof)

    // let index = temp.indexOf(value)
    // this.dialog.open(ImagePreviewDialogComponent, {
    //   data: {
    //     images: temp,
    //     index: index
    //   },
    //   width: "auto"
    // })
  }

  checkForAadhar(key) {
    switch (key) {
      case 'permanent':
        if (this.customerKycAddressOne.controls.addressProofTypeId.value == 2) {
          this.addressImageArray1 = [];
          this.addressIdArray1 = [];
          Array.prototype.push.apply(this.addressImageArray1, this.identityImageArray)
          Array.prototype.push.apply(this.addressIdArray1, this.identityIdArray)
          this.customerKycAddressOne.patchValue({ addressProof: this.addressIdArray1 });
          this.customerKycAddressOne.patchValue({ addressProofNumber: this.reviewForm.controls.identityProofNumber.value });
          this.addressFileNameArray1 = this.identityFileNameArray
          this.customerKycAddressOne.patchValue({ addressProofFileName: this.addressFileNameArray1[this.addressFileNameArray1.length - 1] });
          // this.customerKycAddressOne.controls.addressProofFileName.disable()
          // this.customerKycAddressOne.controls.addressProofNumber.disable()
        } else {
          this.addressImageArray1 = [];
          this.addressIdArray1 = [];;
          this.customerKycAddressOne.patchValue({ addressProof: this.addressIdArray1 });
          this.customerKycAddressOne.patchValue({ addressProofNumber: '' });
          this.addressFileNameArray1 = []
          this.customerKycAddressOne.patchValue({ addressProofFileName: this.addressFileNameArray1 });
          // this.customerKycAddressOne.controls.addressProofFileName.enable()
          // this.customerKycAddressOne.controls.addressProofNumber.enable()
        }
        break;

      case 'residential':
        if (this.customerKycAddressTwo.controls.addressProofTypeId.value == 2) {
          this.addressImageArray2 = [];
          this.addressIdArray2 = [];
          Array.prototype.push.apply(this.addressImageArray2, this.identityImageArray)
          Array.prototype.push.apply(this.addressIdArray2, this.identityIdArray)
          this.customerKycAddressTwo.patchValue({ addressProof: this.addressIdArray2 });
          this.customerKycAddressTwo.patchValue({ addressProofNumber: this.reviewForm.controls.identityProofNumber.value });
          this.addressFileNameArray2 = this.identityFileNameArray
          this.customerKycAddressTwo.patchValue({ addressProofFileName: this.addressFileNameArray2[this.addressFileNameArray2.length - 1] });
          // this.customerKycAddressTwo.controls.addressProofFileName.disable()
          // this.customerKycAddressTwo.controls.addressProofNumber.disable()
        } else {
          this.addressImageArray2 = [];
          this.addressIdArray2 = [];;
          this.customerKycAddressTwo.patchValue({ addressProof: this.addressIdArray2 });
          this.customerKycAddressTwo.patchValue({ addressProofNumber: '' });
          this.addressFileNameArray2 = []
          this.customerKycAddressTwo.patchValue({ addressProofNumber: this.addressFileNameArray2 });
          // this.customerKycAddressTwo.controls.addressProofFileName.enable()
          // this.customerKycAddressTwo.controls.addressProofNumber.enable()
        }
        break;

      default:
        break;
    }

  }


  checkOccupation(event) {
    if (event.target.value == 'null') {
      this.customerKycPersonal.controls.occupationId.patchValue(null)
    }
  }

}
