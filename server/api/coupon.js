const express = require("express")
const bcrypt = require("bcrypt")
const {Op} = require("sequelize")

const Coupon = require('../db/models/coupon.model')
const couponRoute = express.Router()

couponRoute.route("/api/coupons/create").post(async (req, res) => {
	if( req.session.user && req.session.user.email == 'hkstechlabs@gmail.com' ){
		
		let codes = []
		for( let i = 0; i < 100; i++ ){
			codes.push({
				code: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
			})
		}
		let coupons = await Coupon.bulkCreate(codes)
		res.json({res: 'success', text: 'Coupons Created', coupons})
	}else{
		res.json({res: 'error', text: 'Error creating new coupons', coupons: []})
	}
})

couponRoute.route("/api/coupons/list").get( async (req, res) => {
	if( req.session.user && req.session.user.email == 'hkstechlabs@gmail.com' ){
	
		let coupons = await Coupon.findAll()
		res.json(coupons)
	}else{
		res.json({res: 'error', text: 'Error fetching coupons', coupons: [], user: req.session.user})
	}
})


module.exports = couponRoute