const express = require('express');
const superAdminController = require('../controllers/superAdminController');
const Authentication = require('../middlewares/authenication');

const router = express.Router();
router.get('/getallpaymentproof', superAdminController.getAllPaymentProofs);
router.get('/getPaymentProofById/:id', superAdminController.getPaymentProofById);
router.delete('/deletePaymentProof/:id', superAdminController.deletePaymentProof);
router.put('/updatePaymentProof/:id', superAdminController.updatePaymentProof);
router.get("/user/getalluser",Authentication.isAuthenticated,Authentication.isAuthorized("Super Admin"),superAdminController.fetchAllUsers)
router.get("/user/getallcommission",Authentication.isAuthenticated,Authentication.isAuthorized("Super Admin"),superAdminController.fetchMonthlyCreatedCommissions)
router.delete('/:id', superAdminController.deletAuctionItem);

module.exports = router;