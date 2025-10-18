/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PhoneBook.cpp                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: topiana- <topiana-@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/23 12:18:57 by topiana-          #+#    #+#             */
/*   Updated: 2025/04/24 20:01:56 by topiana-         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "PhoneBook.hpp"
#include <iostream>
#include <iomanip>
#include <string>
#include <stdlib.h>

PhoneBook::PhoneBook(void)
{
	this->next_slot = 0;	//not needed theorically
}

/* don't insert empty spaces pls */
static int	is_empty(std::string string)
{
	std::size_t	len;

	len = string.length();
	for (std::size_t i = 0; i < len; i++)
		if (!isspace(string.at(i)))
			return (0);
	return (1);
}

/* Tabs screw up the alignment */
static int	has_tabs(std::string string)
{
	std::size_t	len;

	len = string.length();
	for (std::size_t i = 0; i < len; i++)
		if (string.at(i) < 32)
			return (1);
	return (0);
}

/* Reads the user input, if the user aren't a jerk it's really simple.
If they are... tryes to treat him kindly :D */
static std::string getInput(const std::string& prompt)
{
	std::string input;

	std::cout << prompt << std::endl;
	std::getline(std::cin, input);
	while (!std::cin.eof() && (input.empty() || is_empty(input) || has_tabs(input)))
	{
		std::cout << "... does this looks like a valid input to you?" << std::endl;
		std::getline(std::cin, input);
		if (!input.compare("y") || !input.compare("yes")
			|| !input.compare("Y") || !input.compare("YES"))
		{
			std::cout << "ok... (all data you so carefully wrore will be disintegrated)" << std::endl;
			return ("");
		}
		std::cout << "ok then, " << prompt << std::endl;
		std::getline(std::cin, input);
	}
	return (input);
}

/* Asks for all the info of the contact and adds it to the
'next_slot' slot of the 'contact[]' private attribute. */
void	PhoneBook::add(void)
{
	std::string	input[5];

	input[0] = getInput("Insert the contact's FIRST NAME");
	if (input[0].empty() || is_empty(input[0]))
		return ;
	input[1] = getInput("Insert the contact's LAST NAME");
	if (input[1].empty() || is_empty(input[1]))
		return ;
	input[2] = getInput("Insert the contact's NICKNAME");
	if (input[2].empty() || is_empty(input[2]))
		return ;
	input[3] = getInput("Insert the contact's PHONE NUMBER");
	if (input[3].empty() || is_empty(input[3]))
		return ;
	input[4] = getInput("Insert the contact's DARKEST SECRET");
	if (input[4].empty() || is_empty(input[4]))
		return ;
	this->contact[this->next_slot % 8].first_name = input[0];
	this->contact[this->next_slot % 8].last_name = input[1];
	this->contact[this->next_slot % 8].nickname = input[2];
	this->contact[this->next_slot % 8].setNumber(input[3]);
	this->contact[this->next_slot % 8].setSecret(input[4]);
	this->next_slot++;
}

/* Displays all the contact's data, without esitation */
static void showAllData(Contact contact)
{
	std::cout << "First Name    : " << contact.first_name << std::endl;
	std::cout << "Last Name     : " << contact.last_name << std::endl;
	std::cout << "Nickname      : " << contact.nickname << std::endl;
	std::cout << "Phone Number  : " << contact.getNumber() << std::endl;
	std::cout << "Darkest Secret: " << contact.getSecret() << std::endl;
}	

/* Prints indivual contact's public data, adjusting the length and replacing
truncated char with '.' */
static void showData(std::string data)
{
	if (data.length() > 10)
	{
		data.erase(10);
		data.at(9) = '.';
	}
	std::cout << std::left << std::setw(13 - data.length()) << " | " << data;
}

/* Display a single contac, each culumn is 10 wide, limited by pipes ("|").
NOTE: the pipes are spaced with ' ' (spaces) so that the effective 10-wide
column isn't all cramped. */
static void	showContact(int index, Contact contact[])
{
	std::string	str_idx;

	str_idx.push_back((char)index + '0');
	std::cout << "-----------------------------------------------------" << std::endl;
	std::cout << std::left << std::setw(12 - str_idx.length()) << "| " << str_idx;
	showData(contact[index].first_name);
	showData(contact[index].last_name);
	showData(contact[index].nickname);
	std::cout << " |" << std::endl;
}

/* Displays the full table of registered contacts, without failing ;).
Then asks for an Index and displays the contact at that index (if it's valid ofc) */
void	PhoneBook::search(void)
{
	std::string	input;
	int			i;

	if (this->contact[0].isEmpty())
	{
		std::cout << "No contacts yet..." << std::endl;
		return ;
	}
	i = 0;
	std::cout << "-----------------------------------------------------" << std::endl;
	std::cout << "| Index      | First Name | Last Name  | Nickname   |" << std::endl;
	while (i < 8 && !this->contact[i].isEmpty())
		showContact(i++, this->contact);
	std::cout << "-----------------------------------------------------" << std::endl;
	std::cout << "Which index do you want to examinate?" << std::endl;
	if (!std::getline(std::cin, input))
		return ;
	i = atoi(input.c_str());
	if (i < 0 || i >= 8)
	{
		std::cout << "Invalid index, you lost your chance" << std::endl;
		return ;
	}
	if (this->contact[i].isEmpty())
	{
		std::cout << "Index is empty... (Try with the ones I showed you above)" << std::endl;
		return ;
	}
	showAllData(this->contact[i]);
}
