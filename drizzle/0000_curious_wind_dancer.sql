CREATE TABLE `books` (
	`id` integer PRIMARY KEY NOT NULL,
	`author_name` text NOT NULL,
	`goodreads_author_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`series_title` text,
	`goodreads_id` text,
	`release_date` number,
	`genres` text,
	`cover` text,
	`links` text DEFAULT [] NOT NULL,
	`ratings` text,
	`metadata_readarr_id` integer,
	FOREIGN KEY (`metadata_readarr_id`) REFERENCES `readarr`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `files` (
	`id` integer PRIMARY KEY NOT NULL,
	`path` text NOT NULL,
	`readarr_book_id` integer,
	`book_id` integer NOT NULL,
	`source_readarr_id` integer,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_readarr_id`) REFERENCES `readarr`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `readarr` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`host` text NOT NULL,
	`api_key` text NOT NULL,
	`dir_maps` text DEFAULT [] NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `books_goodreads_id_unique` ON `books` (`goodreads_id`);--> statement-breakpoint
CREATE INDEX `authorName_idx` ON `books` (`author_name`);--> statement-breakpoint
CREATE INDEX `title_idx` ON `books` (`title`);--> statement-breakpoint
CREATE INDEX `description_idx` ON `books` (`description`);--> statement-breakpoint
CREATE INDEX `genres_idx` ON `books` (`genres`);--> statement-breakpoint
CREATE INDEX `seriesTitle_idx` ON `books` (`series_title`);--> statement-breakpoint
CREATE UNIQUE INDEX `files_path_source_readarr_id_unique` ON `files` (`path`,`source_readarr_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `readarr_name_unique` ON `readarr` (`name`);