CREATE TABLE IF NOT EXISTS `user` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `first_name` varchar(100) NOT NULL DEFAULT '',
    `last_name` varchar(100) NOT NULL DEFAULT '',
    `username` varchar(100) NOT NULL,
    `email` varchar(100) NOT NULL,
    `password` varchar(256) NOT NULL, 
    `salt` varchar(256) NOT NULL,
    `roles` enum ('user', 'admin') NOT NULL DEFAULT 'user',
    `reset_password_token` varchar(256),
    `reset_password_expires` datetime,
    `active` tinyint(1) unsigned NOT NULL DEFAULT 1,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY `id` (`id`),
    UNIQUE `email` (`email`),
    INDEX `roles` (`active`)
) ENGINE=InnoDB CHARSET=utf8;
