const schedule = require('node-schedule');
const request = require('request-promise')
const bot = require('slackbots')
var async = require("async");

var competitors = [ "Rico.368208.2", "Dylan.375544.1", "Dave.375542.3", "Miles.377865.4", "Jake.368664.5" ];
var devRef = new bot({
	token: "xoxb-390351167745-511453489873-5C8WpPbqrpBXd0ZVkhBdid6m",
	name: "Ref"
});

devRef.on("start", function () {
	var channel = "devcentral"
	competitors.forEach(function(i){
		announceOne(i)
	})
	resetClock(channel);
})
devRef.on("message", function (data) {
	var channel = "devcentral"
	if (data.type != "message")
	{
		return
	}
	else
	{
		if(data.text.startsWith("devpoints") && data.text != undefined)
		{
			if (data.text.split(" ")[1] === "all")
			{
				console.log("in all")
				announce(channel);
			}
			else
			{
				competitors.forEach(function(i)
				{
					var name = i.split(".")[0]
					if(data.text.split(" ")[1] === name)
					{
						announceOne(i).then(function(v){
							devRef.postMessageToChannel(channel, v)
						})
						
					}
				})
			}
		}
	}
})

function announce(channel)
{	
	var promises = []
	var interval = 100;
	competitors.forEach(function(i)
	{
		//console.log("Called: " + i)
		promises.push(announceOne(i))
	})
	Promise.all(promises).then(function(v){
		console.log(v)
		//console.log(promises)
		var i = 0
		async.whilst(
			function() { return i < v.length},
			function(innerCallback) { console.log(v[i]); devRef.postMessageToChannel(channel, v[i]); setTimeout(function() { i++; innerCallback(); }, 1000) },
			function() { console.log("Done") }
		)
			/*setTimeout(function(){
				//devRef.postMessageToChannel(v[i])
				console.log(v[i])
			}, i * interval)*/
	})
}
function announceOne(person)
{
	var name = person.split(".")[0]
	var extentsion = person.split(".")[1]
	var requestString = 'https://devcentral.f5.com/users/' + extentsion 
    return new Promise(function(resolve, reject) {
		request(requestString, function (error, response, body)
		{
			//console.log('error:', error); // Print the error if one occurred
			//console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
			//console.log('body:', body); // Print the HTML for the Google homepage.
			var page = body;
			var lineNumber = page.search("Dev Points")
			var line = page.substring(lineNumber - 100, lineNumber + 100)
			var devpointsNumber = line.match(/>[0-9]+</g)
			var devpoints = devpointsNumber[0].substring(1, devpointsNumber[0].length - 1)
			//console.log(lineNumber);
			//console.log(line);
			//console.log(person + "/" + person.split("."));
			console.log(name + " has " + devpoints + " and ext " + extentsion)
			//var id = devRef.getUsers()._value.members[0].id
			//console.log(id) 
			competitors[competitors.indexOf(person)] = name + "." + extentsion + "." + devpoints
			competitors = reorder(competitors)
			switch(competitors.indexOf(person))
			{
				case 0:
					resolve(name + " is in first place with " + devpoints + " Dev Points.")
					break
				case 1:
					resolve(name + " is in second place with " + devpoints + " Dev Points.")
					break 
				case 2:
					resolve(name + " is in third place with " + devpoints + " Dev Points.")
					break
				case 3:
					resolve(name + " is in fourth place with " + devpoints + " Dev Points.")
					break
				case 4:
					resolve(name + " is in fifth place with " + devpoints + " Dev Points.")
					break
			}
		})
	})
}
function reorder(list)
{
	//console.log("Before: " + list)
	var tempList = [];
	var newList = [];
	competitors.forEach(function(i){
		tempList.push(i.split(".")[2] + "." + competitors.indexOf(i))
	})
	tempList.sort(function(a, b){return b-a})
	tempList.forEach(function(i){
		newList.push(competitors[i.split(".")[1]])
	})
	//console.log("After: " + newList)
	return newList
	
}
function resetClock(channel)
{
	var now = new Date()
	var resetTime = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate() + 1,
		16, 0, 0
	);
	var msToTime = resetTime.getTime() - now.getTime();
	console.log("Setting timeout");
	setTimeout(function () {
		announce(channel);
		resetClock(channel);
	}, msToTime);
}