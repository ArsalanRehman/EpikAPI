const { emit } = require('process');
const ROSLIB = require('roslib')
const rosnodejs = require('rosnodejs');
const { EventEmitter } = require('stream');
const robot_msgs = rosnodejs.require('robot').msg;
const Position = require('./../models/rosModel')
const AddPositionMarkerSrv = rosnodejs.require('for_arslan').srv.AddPositionMarker;




//listening  to the robotState topic
var lastestStatusMsg = {}
rosnodejs.initNode('/my_node').then(
    () => {
        const nh = rosnodejs.nh;
        const sub = nh.subscribe('/robot_state', 'robot/RobotState', (msg) => {
            // console.log(msg);
            lastestStatusMsg = msg;
        })

    })


var counter = 0;
exports.listenCommand = (req, res) => {
    console.log("My values");
    console.log(req.body.param);
    console.log(req.body.val);
    const { stringify } = require('querystring');

    rosnodejs.initNode('/my_node')
        .then(() => {

            const nh = rosnodejs.nh;
            const arslan = nh.setParam(String(req.body.param), req.body.val);
            arslan.then((result) => {
                console.log(result);
            })
            /////Subscriber and publisher////////////// 
            const sub = nh.subscribe('/arslanTopic', 'std_msgs/String', (msg) => {
                console.log('Got msg on chatter: %j', msg);
            });

            const pub = nh.advertise('/arslanTopic', 'std_msgs/String');
            pub.publish(String(req.body.msg));

            res.status(200).json({
                status: 'success',
                data: {
                    arslan: req.body,
                }
            });

        })
        .catch((err) => {
            rosnodejs.log.error(err.stack);
        })
}
exports.joystick = (req, res) => {
    const start = Date.now();
    rosnodejs.initNode('/my_node')
        .then(() => {
            const endTime = Date.now();
            // console.log('Node Difference', endTime-start);
            const nh = rosnodejs.nh;
            const beforeAdvertise = Date.now();
            const pub = nh.advertise('/cmd_vel', 'geometry_msgs/Twist');
            const afterAdvertise = Date.now();
            // console.log('Advetise Difference', afterAdvertise-beforeAdvertise );

            // while(true){
            setTimeout(function () {
                pub.publish({
                    linear: {
                        x: req.body.x,
                        y: 0,
                        z: 0,
                    },
                    angular: {
                        x: 0,
                        y: 0,
                        z: req.body.z,
                    }
                }
                );
                counter++;
                console.log('Counter', counter, req.body);
                res.status(200).json({
                    status: 'success',
                    data: req.body
                });
                EventEmitter.setMaxListeners(1000);

            }, 10);
            // }
            // console.log(pub)
        });

}
exports.batteryStatus = (req, res) => {
    var percent = lastestStatusMsg.battery_percentege;

    try {
        // console.log(lastestStatusMsg);
        // globalVar = 5;
        res.status(201).json({
            status: 'success',
            Battery: percent
        })
    } catch (err) {
        console.log(err)
    }

}

exports.robotStatus = (req, res) => {

    try {
        // console.log(lastestStatusMsg);
        // globalVar = 5;
        res.status(201).json({
            status: 'success',
            data: lastestStatusMsg
        })
    } catch (err) {
        console.log(err)
    }

}

exports.createPositionMarker = async (req, res) => {

    try {
        const newMarker = await Position.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                Position: newMarker
            }
        })
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            data:{
                err
            }
        })
        console.log(err);
    }
}

exports.getAllPositionMarkers = async (req, res) => {

    try {
        const newMarker = await Position.find();
        res.status(201).json({
            status: 'success',
            data: {
                Position: newMarker
            }
        })
    } catch (err) {
        console.log(err);
    }
}
exports.getPositionMarker = async (req, res) => {

    try {
        const newMarker = await Position.findById(req.params.id);
        res.status(201).json({
            status: 'success',
            data: {
                Position: newMarker
            }
        })
    } catch (err) {
        console.log(err);
    }
}
exports.deletePositionMarker = async (req, res) => {

    try {
        const newMarker = await Position.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: {
                Position: null
            }
        })
    } catch (err) {
        console.log(err);
    }
}



exports.sendGoal = async (req, res) => {
    var request = new AddPositionMarkerSrv.Request();

    const marker = await Position.findById(req.params.id);
    request.position = {
        position: {
          x: marker.x,
          y: marker.y,
          z: 0
        },
        orientation: {
          x: 0,
          y: 0,
          z: 0,
          w: 1
        }
      };
      request.rotation = marker.rotation;
      request.marker_name = marker.name;

    rosnodejs.initNode('/my_node')
        .then(() => {
            const nh = rosnodejs.nh;
            const client = nh.serviceClient('/add_position_marker', 'for_arslan/AddPositionMarker');
            client.call(request);
            res.status(200).json({
                Status: 'success',
                Message: `Goal has been sent to ROS `,
                Destination : `${marker.name}`

            })
        });

}