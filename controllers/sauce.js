const Sauce = require('../models/sauce');
const fs = require('fs');

exports.displayAllSauces = (req, res, next) => {
    Sauce.find()
    .then(
      (sauces) => {
        res.status(200).json(sauces);
      }
    ).catch(
      (error) => {
        res.status(400).json({
          error: error
        });
      }
    );
  };

  exports.displayOneSauce = (req, res, next) => {
    Sauce.findOne({
      _id: req.params.id
    }).then(
      (sauce) => {
        res.status(200).json(sauce);
      }
    ).catch(
      (error) => {
        res.status(404).json({
          error: error
        });
      }
    );
  };

  exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce({
       ...sauceObject,
       userId: req.auth.userId,
       imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
       likes: 0, 
       dislikes: 0,
   });
 
   sauce.save()
    .then(() => { res.status(201).json({message: 'Sauce enregistrée'})})
    .catch(error => { res.status(400).json( { error })})
  };

  exports.modifySauce = (req, res, next) => {
        const sauceObject = req.file ? {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };
      
        delete sauceObject._userId;
        Sauce.findOne({_id: req.params.id})
            .then((sauce) => {
                if (sauce.userId != req.auth.userId) {
                    res.status(403).json({ message : 'unauthorized request'});
                } else {
                    Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
                    .then(() => res.status(200).json({message : 'Sauce modifiée!'}))
                    .catch(error => res.status(401).json({ error }));
                }
            })
            .catch((error) => {
                res.status(400).json({ error });
            });
    };

    exports.deleteSauce = (req, res, next) => {
        Sauce.findOne({ _id: req.params.id})
            .then(sauce => {
                if (sauce.userId != req.auth.userId) {
                    res.status(401).json({message: 'Non autorisé'});
                } else {
                    const filename = sauce.imageUrl.split('/images/')[1];
                    fs.unlink(`images/${filename}`, () => {
                        Sauce.deleteOne({_id: req.params.id})
                            .then(() => { res.status(200).json({message: 'Sauce supprimée'})})
                            .catch(error => res.status(401).json({ error }));
                    });
                }
            })
            .catch( error => {
                res.status(500).json({ error });
            });
     };

     exports.likeSauce = (req, res, next) => {
        Sauce.findOne({_id: req.params.id})
            .then(
                (sauce) => {
                    if (req.body.like == 1) {
                        if (sauce.usersLiked.includes(req.body.userId)) {
                            res.status(401).json({ message : 'Sauce déjà likée'});
                        } 
                        else if (sauce.usersDisliked.includes(req.body.userId)) {
                                sauce.dislikes--;
                                sauce.usersDisliked.splice(sauce.usersDisliked.indexOf(req.body.userId),1)
                                sauce.usersLiked.push(req.body.userId);
                                sauce.likes++;
                                sauce.save()
                                    .then(() => { res.status(201).json({message: 'Sauce enregistrée'})})
                                    .catch(error => { res.status(400).json( { error })});
                        } else {
                                sauce.usersLiked.push(req.body.userId);
                                sauce.likes++;
                                sauce.save()
                                    .then(() => { res.status(201).json({message: 'Sauce enregistrée'})})
                                    .catch(error => { res.status(400).json( { error })});
                            }
                        

                    } else if (req.body.like == -1) {
                        if (sauce.usersDisliked.includes(req.body.userId)) {
                            res.status(401).json({ message : 'Sauce déjà dislikée'});
                        } 
                        else if (sauce.usersLiked.includes(req.body.userId)) {
                                sauce.likes--;
                                sauce.usersLiked.splice(sauce.usersLiked.indexOf(req.body.userId),1)
                                sauce.usersDisliked.push(req.body.userId);
                                sauce.dislikes++;
                                sauce.save()
                                    .then(() => { res.status(201).json({message: 'Sauce enregistrée'})})
                                    .catch(error => { res.status(400).json( { error })});
                        } else {
                                sauce.usersDisliked.push(req.body.userId);
                                sauce.dislikes++;
                                sauce.save()
                                    .then(() => { res.status(201).json({message: 'Sauce enregistrée'})})
                                    .catch(error => { res.status(400).json( { error })});
                            }


                    } else if (req.body.like == 0) {
                        if (sauce.usersDisliked.includes(req.body.userId)) {
                            sauce.dislikes--;
                            sauce.usersDisliked.splice(sauce.usersDisliked.indexOf(req.body.userId),1);
                            sauce.save()
                                    .then(() => { res.status(201).json({message: 'Sauce enregistrée'})})
                                    .catch(error => { res.status(400).json( { error })});
                        } else if (sauce.usersLiked.includes(req.body.userId)) {
                            sauce.likes--;
                            sauce.usersLiked.splice(sauce.usersLiked.indexOf(req.body.userId),1);
                            sauce.save()
                                    .then(() => { res.status(201).json({message: 'Sauce enregistrée'})})
                                    .catch(error => { res.status(400).json( { error })});
                        }
                    }


                }
            ).catch(
                (error) => {
                res.status(404).json({
                    error: error
                });
                }
            );

     };
