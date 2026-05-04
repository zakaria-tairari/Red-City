<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('places', function (Blueprint $table) {
            $table->id();
            $table->integer('document_id');
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->string('name', 255);
            $table->string('email', 255);
            $table->string('phone', 50);
            $table->string('website', 255);
            $table->string('area', 150);
            $table->text('address');
            $table->decimal('lat', 10, 6);
            $table->decimal('lon', 10, 6);
            $table->text('summary');
            $table->longText('description');
            $table->boolean('tags_generated');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('places');
    }
};
