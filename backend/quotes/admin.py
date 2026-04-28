# region IMPORTS ==============================================
import os
import tempfile

from django.conf import settings
from django.contrib import admin

from .models import Quote
from .serializers import QuoteListSerializer

# endregion ==============================================


# region ADMIN ACTION ==============================================


@admin.action(description="Generate Quotes")
def generate_quotes(model_admin, req, selected):
    def clean_quotes():
        settings.LOGGER.info(
            msg=f"Quote file directory: {os.path.dirname(os.path.realpath(__file__))}"
        )
        quote_file_location = (
            os.path.dirname(os.path.realpath(__file__)) + "/unique_quotes.txt"
        )
        settings.LOGGER.info(msg=f"Quote file location: {quote_file_location}")
        with open(quote_file_location) as quotesfile:
            processed_1 = []
            duplicates = []
            unique_quotes = []
            array_of_raw_quotes = quotesfile.readlines()
            for line in array_of_raw_quotes:
                line.strip()
                line.lower()
                if line not in processed_1:
                    processed_1.append(line)
                else:
                    duplicates.append(line)
            for p1 in processed_1:
                line_array = p1.split(" - ")
                check = len(line_array)
                if check <= 2:
                    quote = line_array[0]
                    author = line_array[1]
                else:
                    quote_array = line_array[:-1]
                    quote = " - ".join(item for item in quote_array)
                    quote.strip()
                    author = line_array[-1]
                unique_quotes.append({"text": quote, "author": author})

            settings.LOGGER.info(msg=f"Formatting: {unique_quotes[0]}")
            settings.LOGGER.info(
                msg=f"Uniques: {len(unique_quotes)}/{len(array_of_raw_quotes)}"
            )
            settings.LOGGER.info(msg=f"Duplicates: {duplicates}")
            return unique_quotes

    if len(selected) > 1:
        settings.LOGGER.info(msg="Please select only one item")
        model_admin.message_user(req, "Please select only one item.")
        return
    uniques = clean_quotes()
    try:
        for obj in uniques:
            ser = QuoteListSerializer(data=obj)
            if ser.is_valid():
                ser.save()
            else:
                settings.LOGGER.error(msg=f"Error saving quote: {ser.errors}")
        settings.LOGGER.info(msg="Quotes generated successfully")
        model_admin.message_user(req, "Quotes generated successfully.")
    except Exception as e:
        settings.LOGGER.error(msg=f"Error generating quotes: {e}")


@admin.action(description="Selected to TXT")
def export_selected_quotes_txt(model_admin, req, selected):
    # Use tempfile to create a temporary file
    with tempfile.NamedTemporaryFile(
        delete=False, mode="w", encoding="utf-8"
    ) as temp_file:
        for quote in selected:
            text = quote.text
            author = quote.author
            temp_file.write(f"{text} - {author}\n")
        temp_file_path = temp_file.name
    try:
        settings.LOGGER.info(msg=f"Exported to {temp_file_path}")
    except Exception as e:
        settings.LOGGER.error(msg=f"Error exporting quotes: {e}")


@admin.action(description="All to TXT")
def export_all_quotes_txt(model_admin, req, selected):
    if len(selected) > 1:
        settings.LOGGER.info(msg="Please select only one item")
        model_admin.message_user(req, "Please select only one item.")
        return
    # Use tempfile to create a temporary file
    with tempfile.NamedTemporaryFile(
        delete=False, mode="w", encoding="utf-8"
    ) as temp_file:
        saved_quotes = Quote.objects.all()
        for quote in saved_quotes:
            text = quote.text
            author = quote.author
            temp_file.write(f"{text} - {author}\n")
        temp_file_path = temp_file.name
    try:
        settings.LOGGER.info(msg=f"Exported to {temp_file_path}")
    except Exception as e:
        settings.LOGGER.error(msg=f"Error exporting quotes: {e}")


# endregion ==============================================

# region ADMIN ==============================================


@admin.register(Quote)
class QuoteAdmin(admin.ModelAdmin):
    actions = (
        generate_quotes,
        export_selected_quotes_txt,
        export_all_quotes_txt,
    )
    list_display = [
        "text",
        "author",
        "created_at",
        "updated_at",
    ]
    list_filter = ["author"]
    search_fields = ["text", "author"]


# endregion ==============================================
